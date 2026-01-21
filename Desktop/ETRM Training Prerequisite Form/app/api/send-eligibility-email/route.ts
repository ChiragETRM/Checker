import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { appendFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const LOG_PATH = join(process.cwd(), '.cursor', 'debug.log')
const LOG_DIR = join(process.cwd(), '.cursor')

async function logDebug(data: any) {
  try {
    if (!existsSync(LOG_DIR)) {
      await mkdir(LOG_DIR, { recursive: true })
    }
    await appendFile(LOG_PATH, JSON.stringify(data) + '\n', 'utf8')
    console.log('[DEBUG]', JSON.stringify(data))
  } catch (e) {
    console.error('Logging error:', e)
    console.log('[DEBUG FALLBACK]', JSON.stringify(data))
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { answers, result, userEmail } = body

    // #region agent log
    await logDebug({location:'route.ts:12',message:'API route called',data:{hasBody:!!body,hasAnswers:!!answers,hasResult:!!result,userEmail},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'});
    // #endregion

    // #region agent log
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD ? '***' : undefined;
    const allEnvKeys = Object.keys(process.env).filter(k => k.includes('SMTP'));
    await logDebug({location:'route.ts:33',message:'SMTP env vars check',data:{smtpHost,smtpPort,smtpUser,hasSmtpPass:!!process.env.SMTP_PASSWORD,allEnvKeys,nodeEnv:process.env.NODE_ENV,smptHostType:typeof smtpHost,smptHostLength:smtpHost?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'});
    // #endregion

    // Validate environment variables
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      const missingVars = [];
      if (!process.env.SMTP_HOST) missingVars.push('SMTP_HOST');
      if (!process.env.SMTP_USER) missingVars.push('SMTP_USER');
      if (!process.env.SMTP_PASSWORD) missingVars.push('SMTP_PASSWORD');
      
      await logDebug({location:'route.ts:42',message:'Missing SMTP env vars',data:{missingVars,allEnvKeys},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'});
      
      return NextResponse.json(
        { success: false, error: `Missing required environment variables: ${missingVars.join(', ')}. Please ensure .env.local file exists and server was restarted.` },
        { status: 500 }
      )
    }

    // Create transporter
    const transporterConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };

    // #region agent log
    await logDebug({location:'route.ts:32',message:'Transporter config before creation',data:{host:transporterConfig.host,port:transporterConfig.port,hasUser:!!transporterConfig.auth.user,hasPass:!!transporterConfig.auth.pass},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'});
    // #endregion

    const transporter = nodemailer.createTransport(transporterConfig);

    // Format the email body
    const emailBody = `
New Eligibility Check Submission

User Email: ${userEmail}

FORM DETAILS:
================
Q1. Current professional status: ${answers.currentStatus}
Q2. Closest exposure to trading workflows: ${answers.tradingExposure}
Q3. Comfort with numbers and systems: ${answers.comfortLevel}
Q4. Primary reason for this workshop: ${answers.primaryReason}
Q5. Country: ${answers.country}
Q6. Work permit: ${answers.workPermit}
Q7. Overall job experience: ${answers.overallExperience}
Q8. ETRM/related field experience: ${answers.etrmExperience}

RESULT:
================
Eligibility: ${result.eligible ? 'Eligible' : 'Not Eligible'}
${result.recommendation ? `Recommendation: ${result.recommendation}` : ''}

Reasoning:
${result.reasons.map((reason: string, idx: number) => `${idx + 1}. ${reason}`).join('\n')}

---
This email was automatically generated from the LearnETRM Eligibility Form.
    `.trim()

    // #region agent log
    await logDebug({location:'route.ts:64',message:'Before sendMail call',data:{from:process.env.SMTP_FROM,to:'apexetrm@gmail.com',hasSubject:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'});
    // #endregion

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: 'apexetrm@gmail.com',
      subject: `New Eligibility Check - ${result.eligible ? 'Eligible' : 'Not Eligible'} - ${userEmail}`,
      text: emailBody,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Eligibility Check Submission</h2>
          
          <p><strong>User Email:</strong> ${userEmail}</p>
          
          <h3 style="color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">FORM DETAILS</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Q1. Current professional status</strong></td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${answers.currentStatus}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Q2. Closest exposure to trading workflows</strong></td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${answers.tradingExposure}</td>
            </tr>
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Q3. Comfort with numbers and systems</strong></td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${answers.comfortLevel}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Q4. Primary reason for this workshop</strong></td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${answers.primaryReason}</td>
            </tr>
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Q5. Country</strong></td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${answers.country}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Q6. Work permit</strong></td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${answers.workPermit}</td>
            </tr>
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Q7. Overall job experience</strong></td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${answers.overallExperience}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Q8. ETRM/related field experience</strong></td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${answers.etrmExperience}</td>
            </tr>
          </table>
          
          <h3 style="color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">RESULT</h3>
          <div style="background-color: ${result.eligible ? '#dbeafe' : '#fee2e2'}; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Eligibility:</strong> <span style="color: ${result.eligible ? '#059669' : '#dc2626'}; font-weight: bold;">${result.eligible ? 'Eligible' : 'Not Eligible'}</span></p>
            ${result.recommendation ? `<p style="margin: 5px 0;"><strong>Recommendation:</strong> ${result.recommendation}</p>` : ''}
          </div>
          
          <h4 style="color: #374151;">Reasoning:</h4>
          <ul style="line-height: 1.8;">
            ${result.reasons.map((reason: string) => `<li style="margin-bottom: 8px;">${reason}</li>`).join('')}
          </ul>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px;">This email was automatically generated from the LearnETRM Eligibility Form.</p>
        </div>
      `,
    })

    // #region agent log
    await logDebug({location:'route.ts:124',message:'Email sent successfully',data:{success:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'});
    // #endregion

    return NextResponse.json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    // #region agent log
    const errorDetails = error instanceof Error ? {message:error.message,name:error.name,code:(error as any).code,errno:(error as any).errno,syscall:(error as any).syscall,address:(error as any).address,port:(error as any).port} : {error:String(error)};
    await logDebug({location:'route.ts:129',message:'Error caught in catch block',data:errorDetails,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'});
    // #endregion

    console.error('Error sending email:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
