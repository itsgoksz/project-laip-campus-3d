import { GoogleGenAI } from '@google/genai';
import type { FireExtinguisherDetails, WorkOrder } from '../types/fireSafety';
import { analyzeFireExtinguisher, analyzeSmokeDetector, type AssetAnalysisResult } from './campusAssetModel';

export interface AgentContext {
  fireSafetyData: FireExtinguisherDetails;
  onUpdateFireSafetyData: (data: FireExtinguisherDetails) => void;
  setActiveAsset: (asset: string | null) => void;
  setViewMode: (mode: 'campus' | 'classroom') => void;
  lightsOn?: boolean;
  setLightsOn?: (lights: boolean | ((prev: boolean) => boolean)) => void;
}

export interface AgentResponse {
  text: string;
  actionTaken?: {
    type: 'NAVIGATE' | 'WORK_ORDER_CREATED' | 'LIGHTS_TOGGLED' | 'ANALYSIS';
    summary: string;
    details?: any;
  };
}

/**
 * Handles intent with real Gemini API when key is present,
 * or seamlessly falls back to the deterministic lightweight asset engine.
 */
export async function processAgentQuery(query: string, ctx: AgentContext): Promise<AgentResponse> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY?.trim();

  // Run our asset trained model analysis
  const feAnalysis = analyzeFireExtinguisher(ctx.fireSafetyData);
  const sdAnalysis = analyzeSmokeDetector();

  if (apiKey) {
    try {
      return await queryGeminiAgent(query, ctx, apiKey, feAnalysis, sdAnalysis);
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local asset intelligence engine:', err);
      return runLocalAgentEngine(query, ctx, feAnalysis, sdAnalysis);
    }
  }

  // Fallback to local engine when API key is not yet set
  return runLocalAgentEngine(query, ctx, feAnalysis, sdAnalysis);
}

/**
 * Real Google Gemini 2.5 Flash execution with dynamic grounding & tool actions
 */
async function queryGeminiAgent(
  query: string,
  ctx: AgentContext,
  apiKey: string,
  feAnalysis: AssetAnalysisResult,
  sdAnalysis: AssetAnalysisResult
): Promise<AgentResponse> {
  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt = `You are "Campus AI Copilot", an intelligent, high-precision operations assistant embedded in the Campus OS 3D command center.
You monitor life safety assets (Fire Extinguisher FE-A101-ABC-04, Ceiling Smoke Detector SD-101, Lighting, and Facilities).

CURRENT LIVE ASSET DATA & INFERRED MODEL STATE:
- Fire Extinguisher (Classroom 101):
  * Tag: ${ctx.fireSafetyData.tag}
  * Health Score: ${feAnalysis.healthScore}% (${feAnalysis.status})
  * Tank Pressure: ${ctx.fireSafetyData.pressureMPa} MPa (Nominal range: 1.2 - 1.4 MPa)
  * Pin & Seal: Pin intact: ${ctx.fireSafetyData.pinIntact}, Tamper Seal: ${ctx.fireSafetyData.tamperSealIntact}
  * Last Inspected: ${ctx.fireSafetyData.lastInspectedDate} (${ctx.fireSafetyData.lastInspectedDaysAgo} days ago)
  * Next Inspection: Due in ${ctx.fireSafetyData.inspectionDueInDays} days
  * Next 6-Yr Internal Teardown: ${ctx.fireSafetyData.nextInternalInspectionDate}
  * Next 12-Yr Hydrostatic Test: ${ctx.fireSafetyData.nextHydroTestDate}
  * Certifications: NFPA 10 Compliant, UL Rating: ${ctx.fireSafetyData.ulRating}, Class: ${ctx.fireSafetyData.classification}
  * Chemical Agent: ${ctx.fireSafetyData.extinguishingAgent} (${ctx.fireSafetyData.capacity})
  * Diagnosed Anomalies: ${feAnalysis.anomalies.length > 0 ? feAnalysis.anomalies.join('; ') : 'None'}
  * Failure Risk Probability: ${feAnalysis.failureRiskPercentage}%
  * Recommended Action: ${feAnalysis.recommendedAction}
  * Active Work Orders: ${ctx.fireSafetyData.workOrders.length} tickets logged

- Ceiling Smoke Detector SD-101:
  * Health: ${sdAnalysis.healthScore}%, PM2.5: 12 µg/m³, CO: 0 PPM, PoE Health: 98%
  * Status: Online & Nominal

TOOLS YOU CAN TRIGGER:
If the user wants to inspect or see an asset, or create a work order, or toggle lights, output a JSON block at the very end of your response with the schema:
ACTION_CALL: { "action": "CREATE_WORK_ORDER", "title": string, "priority": "Low"|"Medium"|"High"|"Critical", "description": string }
or
ACTION_CALL: { "action": "NAVIGATE_ASSET", "asset": "fireExtinguisher"|"smokeDetector"|"maintenance"|"campus" }
or
ACTION_CALL: { "action": "TOGGLE_LIGHTS", "state": boolean }

Keep answers concise, professional, direct, and conversational. Emphasize compliance, exact dates, and technical details accurately.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      { role: 'user', parts: [{ text: `${systemPrompt}\n\nUSER QUESTION: "${query}"` }] }
    ],
  });

  const fullText = response.text || '';
  let cleanText = fullText;
  let actionTaken: AgentResponse['actionTaken'] = undefined;

  // Check if an action was requested in the output
  const actionMatch = fullText.match(/ACTION_CALL:\s*(\{.*?\})/s);
  if (actionMatch) {
    try {
      const actionObj = JSON.parse(actionMatch[1]);
      cleanText = fullText.replace(/ACTION_CALL:\s*\{.*?\}/s, '').trim();

      if (actionObj.action === 'CREATE_WORK_ORDER') {
        const newOrder: WorkOrder = {
          id: `WO-${Math.floor(1000 + Math.random() * 9000)}`,
          title: actionObj.title || 'Reported Asset Issue',
          priority: actionObj.priority || 'High',
          status: 'Open',
          createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          technician: 'EHS On-Call Dispatch',
          description: actionObj.description || 'Auto-generated via Campus AI Copilot voice/chat command.',
        };

        ctx.onUpdateFireSafetyData({
          ...ctx.fireSafetyData,
          workOrders: [newOrder, ...ctx.fireSafetyData.workOrders],
        });

        actionTaken = {
          type: 'WORK_ORDER_CREATED',
          summary: `Created Work Order #${newOrder.id}: ${newOrder.title}`,
          details: newOrder,
        };
      } else if (actionObj.action === 'NAVIGATE_ASSET') {
        if (actionObj.asset === 'fireExtinguisher' || actionObj.asset === 'smokeDetector') {
          ctx.setViewMode('classroom');
          ctx.setActiveAsset(actionObj.asset);
        } else if (actionObj.asset === 'campus') {
          ctx.setViewMode('campus');
          ctx.setActiveAsset(null);
        } else {
          ctx.setActiveAsset(actionObj.asset);
        }

        actionTaken = {
          type: 'NAVIGATE',
          summary: `Navigated to ${actionObj.asset}`,
        };
      } else if (actionObj.action === 'TOGGLE_LIGHTS' && ctx.setLightsOn) {
        ctx.setLightsOn(actionObj.state);
        actionTaken = {
          type: 'LIGHTS_TOGGLED',
          summary: `Turned lights ${actionObj.state ? 'ON' : 'OFF'}`,
        };
      }
    } catch {
      // JSON parse error, ignore action
    }
  }

  return { text: cleanText, actionTaken };
}

/**
 * Deterministic local asset intelligence engine.
 * Understands natural queries regarding inspections, dates, anomalies, and work orders.
 */
function runLocalAgentEngine(
  query: string,
  ctx: AgentContext,
  feAnalysis: AssetAnalysisResult,
  sdAnalysis: AssetAnalysisResult
): AgentResponse {
  const q = query.toLowerCase();

  // 1. Work Order Creation Query
  if (q.includes('work order') || q.includes('create ticket') || q.includes('leak') || q.includes('service request') || q.includes('refill')) {
    const priority = q.includes('critical') || q.includes('leak') || q.includes('urgent') ? 'Critical' : 'High';
    const title = q.includes('pressure') || q.includes('leak') 
      ? 'Low Tank Pressure & Valve Leak Service' 
      : q.includes('refill') 
      ? 'Chemical Agent Refill & Discharge Service'
      : 'EHS Maintenance Service Request';

    const newOrder: WorkOrder = {
      id: `WO-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      priority,
      status: 'Open',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      technician: 'Campus Life Safety On-Call Team',
      description: `Dispatched via Campus AI Copilot in response to user request: "${query}". Initiating physical equipment inspection.`,
    };

    ctx.onUpdateFireSafetyData({
      ...ctx.fireSafetyData,
      workOrders: [newOrder, ...ctx.fireSafetyData.workOrders],
    });

    return {
      text: `Work Order **#${newOrder.id}** (${priority} Priority) has been dispatched for **${ctx.fireSafetyData.tag}**. Facilities maintenance has been alerted to inspect the cylinder and valve seals.`,
      actionTaken: {
        type: 'WORK_ORDER_CREATED',
        summary: `Dispatched Work Order #${newOrder.id}`,
        details: newOrder,
      },
    };
  }

  // 2. Next Maintenance / Expiry / Due Dates Query
  if (q.includes('next') || q.includes('when') || q.includes('date') || q.includes('due') || q.includes('schedule') || q.includes('expiry') || q.includes('expire')) {
    if (q.includes('smoke') || q.includes('detector') || q.includes('alarm')) {
      return {
        text: `**Ceiling Smoke Detector SD-101** is currently **${sdAnalysis.status}** with ${sdAnalysis.healthScore}% health. Next scheduled maintenance and audible horn decibel check is on **${sdAnalysis.nextScheduledService}** (${sdAnalysis.daysUntilServiceDue} days).`,
        actionTaken: { type: 'ANALYSIS', summary: 'Checked Smoke Detector Schedule' },
      };
    }

    return {
      text: `**Classroom 101 Fire Extinguisher (${ctx.fireSafetyData.tag})** maintenance schedule:
- **Next Monthly Visual:** Due in **${ctx.fireSafetyData.inspectionDueInDays} days** (Last inspected: ${ctx.fireSafetyData.lastInspectedDate}).
- **6-Year Internal Teardown:** Scheduled for **${ctx.fireSafetyData.nextInternalInspectionDate}**.
- **12-Year Hydrostatic Test:** Scheduled for **${ctx.fireSafetyData.nextHydroTestDate}**.
Overall status is **${ctx.fireSafetyData.complianceStatus}** with a health score of **${feAnalysis.healthScore}%**.`,
      actionTaken: { type: 'ANALYSIS', summary: 'Retrieved Maintenance Dates' },
    };
  }

  // 3. Health / Status / Anomaly / Working Query
  if (q.includes('health') || q.includes('status') || q.includes('working') || q.includes('online') || q.includes('anomaly') || q.includes('anomalies')) {
    if (q.includes('smoke') || q.includes('detector')) {
      return {
        text: `Ceiling Smoke Detector **SD-101** is **Online and Working**.
- **Particulate Matter (PM2.5):** 12 µg/m³ (Optimal)
- **Carbon Monoxide (CO):** 0 PPM (Clean)
- **Chamber Health:** 98% (PoE hardwired primary with battery backup ok).`,
        actionTaken: { type: 'ANALYSIS', summary: 'Smoke Detector Status' },
      };
    }

    const anomalySummary = feAnalysis.anomalies.length > 0 
      ? `Identified anomalies: ${feAnalysis.anomalies.join('; ')}`
      : 'No anomalies detected. Pressure gauge is green and tamper seal is intact.';

    return {
      text: `**${ctx.fireSafetyData.name} (${ctx.fireSafetyData.tag})**:
- **Health Rating:** ${feAnalysis.healthScore}% (${feAnalysis.status})
- **Current Pressure:** ${ctx.fireSafetyData.pressureMPa} MPa (Nominal: 1.2–1.4 MPa)
- **Operational Condition:** Working & ${ctx.fireSafetyData.complianceStatus}
- **Anomalies:** ${anomalySummary}
- **Predicted Risk:** ${feAnalysis.failureRiskPercentage}% failure risk. ${feAnalysis.recommendedAction}`,
      actionTaken: { type: 'ANALYSIS', summary: 'Comprehensive Health Analysis' },
    };
  }

  // 4. Certifications Query
  if (q.includes('certif') || q.includes('rating') || q.includes('ul') || q.includes('nfpa') || q.includes('spec')) {
    return {
      text: `**Certifications & Specs for ${ctx.fireSafetyData.tag}**:
- **Classification:** ${ctx.fireSafetyData.classification} (UL Rating: **${ctx.fireSafetyData.ulRating}**)
- **NFPA Standard:** NFPA 10 compliant mounting at **${ctx.fireSafetyData.mountingHeightInches}"** height (max allowable 60")
- **Agent:** ${ctx.fireSafetyData.extinguishingAgent} (${ctx.fireSafetyData.capacity})
- **Manufacturer:** ${ctx.fireSafetyData.manufacturer} (Serial: ${ctx.fireSafetyData.serialNumber})`,
      actionTaken: { type: 'ANALYSIS', summary: 'Certification Report' },
    };
  }

  // 5. Navigation / Focus asset in 3D scene
  if (q.includes('show') || q.includes('view') || q.includes('fly') || q.includes('go to') || q.includes('look at') || q.includes('focus')) {
    if (q.includes('fire') || q.includes('extinguisher')) {
      ctx.setViewMode('classroom');
      ctx.setActiveAsset('fireExtinguisher');
      return {
        text: `Camera transitioned to **Classroom 101**. Focusing on the Fire Extinguisher unit.`,
        actionTaken: { type: 'NAVIGATE', summary: 'Navigated to Fire Extinguisher' },
      };
    }
    if (q.includes('smoke') || q.includes('detector') || q.includes('sensor')) {
      ctx.setViewMode('classroom');
      ctx.setActiveAsset('smokeDetector');
      return {
        text: `Camera transitioned to **Classroom 101 ceiling**. Focusing on Smoke Sensor SD-101.`,
        actionTaken: { type: 'NAVIGATE', summary: 'Navigated to Smoke Detector' },
      };
    }
    if (q.includes('campus') || q.includes('master')) {
      ctx.setViewMode('campus');
      ctx.setActiveAsset(null);
      return {
        text: `Camera reset to **Campus Master Overview**.`,
        actionTaken: { type: 'NAVIGATE', summary: 'Navigated to Campus Master' },
      };
    }
  }

  // 6. Generic response
  return {
    text: `I am monitoring campus life safety assets. Fire Extinguisher **${ctx.fireSafetyData.tag}** is **${ctx.fireSafetyData.complianceStatus}** (${feAnalysis.healthScore}% health, next check in ${ctx.fireSafetyData.inspectionDueInDays} days). You can ask me about inspection dates, anomalies, certifications, or ask me to "create a work order for low pressure".`,
    actionTaken: { type: 'ANALYSIS', summary: 'General Overview' },
  };
}
