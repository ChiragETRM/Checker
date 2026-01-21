'use client'

import { useState, useEffect } from 'react'

// Country buckets mapping
const DEVELOPED_COUNTRIES = [
  'United Kingdom', 'Ireland', 'Germany', 'France', 'Netherlands', 'Belgium',
  'Luxembourg', 'Spain', 'Portugal', 'Italy', 'Austria', 'Switzerland',
  'Norway', 'Sweden', 'Denmark', 'Finland', 'Poland', 'Czech Republic',
  'Slovakia', 'Hungary', 'Romania', 'Bulgaria', 'Greece', 'United States',
  'Canada', 'Australia', 'New Zealand', 'Singapore', 'Japan', 'South Korea',
  'Hong Kong', 'Taiwan', 'Israel', 'Estonia', 'Latvia', 'Lithuania',
  'Slovenia', 'Croatia', 'Malta', 'Cyprus', 'Iceland', 'Liechtenstein',
  'Monaco', 'Andorra', 'San Marino', 'Vatican City'
]

const EMERGING_COUNTRIES = [
  'India', 'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman',
  'Bahrain', 'Turkey', 'South Africa', 'Nigeria', 'Kenya', 'Brazil', 'Mexico',
  'Colombia', 'Indonesia', 'Malaysia', 'Thailand', 'Vietnam', 'Philippines',
  'China', 'Russia', 'Argentina', 'Chile', 'Peru', 'Egypt', 'Morocco',
  'Tunisia', 'Algeria', 'Ghana', 'Tanzania', 'Uganda', 'Ethiopia', 'Bangladesh',
  'Pakistan', 'Sri Lanka', 'Myanmar', 'Cambodia', 'Laos', 'Mongolia',
  'Kazakhstan', 'Uzbekistan', 'Ukraine', 'Belarus', 'Serbia', 'Bosnia and Herzegovina',
  'North Macedonia', 'Albania', 'Moldova', 'Georgia', 'Armenia', 'Azerbaijan',
  'Lebanon', 'Jordan', 'Iraq', 'Iran', 'Kyrgyzstan',
  'Tajikistan', 'Turkmenistan', 'Afghanistan', 'Nepal', 'Bhutan', 'Maldives'
]

const ALL_COUNTRIES = [...DEVELOPED_COUNTRIES, ...EMERGING_COUNTRIES].sort()

type CountryBucket = 'developed' | 'emerging'

interface QuizAnswers {
  currentStatus: string
  tradingExposure: string
  targetRole: string
  comfortLevel: string
  primaryReason: string
  country: string
  workPermit: string
  overallExperience: string
  etrmExperience: string
  email: string
}

interface EligibilityResult {
  eligible: boolean
  recommendation?: 'Strong Fit' | 'Borderline' | 'Not a Fit'
  reasons: string[]
}

export default function FitQuizPage() {
  const [answers, setAnswers] = useState<QuizAnswers>({
    currentStatus: 'Consultant / IT / implementation supporting trading systems',
    tradingExposure: 'Support trading desks indirectly (IT, data, compliance, ops)',
    targetRole: '',
    comfortLevel: 'Comfortable with numbers, logic, and complex systems',
    primaryReason: 'Accelerate my career within energy/commodity trading',
    country: '',
    workPermit: '',
    overallExperience: '',
    etrmExperience: '',
    email: '',
  })

  const [result, setResult] = useState<EligibilityResult | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('etrm-quiz-answers')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setAnswers(parsed)
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [])

  // Save to localStorage whenever answers change
  useEffect(() => {
    if (Object.values(answers).some(v => v !== '')) {
      localStorage.setItem('etrm-quiz-answers', JSON.stringify(answers))
    }
  }, [answers])

  const handleChange = (field: keyof QuizAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }))
    setShowResult(false)
    setResult(null)
  }

  // Define question order
  const questions = [
    { field: 'currentStatus' as keyof QuizAnswers, label: 'Q1. Current professional status', description: 'Select your current professional situation', required: true },
    { field: 'tradingExposure' as keyof QuizAnswers, label: 'Q2. Closest exposure to trading workflows', description: 'How closely have you worked with trading operations?', required: true },
    { field: 'comfortLevel' as keyof QuizAnswers, label: 'Q3. Comfort with numbers and systems', description: 'How comfortable are you with quantitative and technical work?', required: true },
    { field: 'primaryReason' as keyof QuizAnswers, label: 'Q4. Primary reason for this workshop', description: 'What is your main motivation?', required: true },
    { field: 'country' as keyof QuizAnswers, label: 'Q5. Which country are you currently residing in?', description: 'Select your current country of residence', required: true },
    { field: 'workPermit' as keyof QuizAnswers, label: 'Q6. Do you have a work permit for the country you live in?', description: 'Work authorization status', required: true },
    { field: 'overallExperience' as keyof QuizAnswers, label: 'Q7. How many years of overall job experience do you have?', description: 'Total professional experience', required: true },
    { field: 'etrmExperience' as keyof QuizAnswers, label: 'Q8. How many years of ETRM or related field job experience do you have?', description: 'ETRM/CTRM specific experience', required: true },
    { field: 'email' as keyof QuizAnswers, label: 'Email Address', description: 'Your email address', required: true },
  ]

  const totalSteps = questions.length
  const isLastStep = currentStep === totalSteps - 1
  const isFirstStep = currentStep === 0

  const getCurrentQuestion = () => questions[currentStep]

  const canProceed = () => {
    const question = getCurrentQuestion()
    if (!question) return false
    
    const value = answers[question.field]
    if (question.field === 'email') {
      return isValidEmail(value)
    }
    return value !== ''
  }

  const handleNext = () => {
    if (canProceed() && !isLastStep) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const getCountryBucket = (country: string): CountryBucket | null => {
    if (!country) return null
    if (DEVELOPED_COUNTRIES.includes(country)) return 'developed'
    if (EMERGING_COUNTRIES.includes(country)) return 'emerging'
    return null
  }

  const calculateEligibility = (): EligibilityResult => {
    const reasons: string[] = []
    let eligible = true

    // Gate 1: Work Authorization (absolute)
    if (answers.workPermit === 'No') {
      return {
        eligible: false,
        reasons: [
          'This workshop is designed for participants who can actively pursue roles in their current job market after completion.',
          'As you currently do not have work authorization in your country of residence, it would be difficult to translate this training into a realistic job outcome.',
        ],
      }
    }

    const countryBucket = getCountryBucket(answers.country)

    // Gate 2: Mid-career switcher in developed market
    if (
      countryBucket === 'developed' &&
      (answers.overallExperience === '2-5 years' || answers.overallExperience === '> 5 years') &&
      answers.currentStatus === 'Working professional in an unrelated field' &&
      answers.etrmExperience === '0-2 years'
    ) {
      eligible = false
      reasons.push(
        'In developed job markets, energy companies typically hire ETRM professionals who already operate close to trading, risk, or energy-market workflows.',
        'With several years of experience in an unrelated field, transitioning directly into ETRM roles through a short, intensive program is statistically very challenging.',
      )
    }

    // Gate 4: Avoids numbers/systems
    if (answers.comfortLevel === 'I actively avoid numbers and technical topics') {
      eligible = false
      reasons.push(
        'ETRM roles are highly systems-driven and involve working closely with data, calculations, and complex workflows.',
        'Given your stated preference to avoid technical and numerical topics, this program is unlikely to align well with your strengths or career goals.',
      )
    }

    // Gate 5: Weak intent + low domain exposure
    if (
      answers.primaryReason === 'General interest in learning and development' &&
      answers.etrmExperience === '0-2 years'
    ) {
      eligible = false
      reasons.push(
        'This workshop is designed for participants with a clear intent to apply the learning directly in an ETRM-related role.',
        'When participation is driven primarily by general interest, without prior domain exposure, the practical career impact is usually limited.',
      )
    }

    // Gate 6: Senior professional but near-zero ETRM exposure
    if (
      answers.overallExperience === '> 5 years' &&
      answers.etrmExperience === '0-2 years'
    ) {
      eligible = false
      reasons.push(
        'With more than five years of overall professional experience, ETRM hiring typically expects corresponding domain depth.',
        'Transitioning into ETRM roles at this stage without sufficient related experience can be difficult, and the workshop may not deliver the return on effort you would expect.',
      )
    }

    // Gate 7: Student/new grad in developed markets
    if (
      countryBucket === 'developed' &&
      answers.currentStatus === 'Student / recent graduate (quant/finance/engineering)' &&
      answers.etrmExperience === '0-2 years'
    ) {
      eligible = false
      reasons.push(
        'In developed markets, most energy companies hire early-career ETRM talent through internships, graduate programs, or internal rotations.',
        'This workshop is better suited to candidates who already have some practical exposure to energy or trading environments.',
      )
    }

    if (!eligible) {
      return { eligible: false, reasons }
    }

    // If eligible, calculate recommendation
    let recommendation: 'Strong Fit' | 'Borderline' | 'Not a Fit' = 'Strong Fit'
    const positiveFactors: string[] = []
    const cautionFactors: string[] = []

    // Positive factors
    if (
      answers.currentStatus === 'Working in energy trading / commodities / power / gas / fuels' ||
      answers.currentStatus === 'Consultant / IT / implementation supporting trading systems'
    ) {
      positiveFactors.push('Your direct experience in energy trading or ETRM systems provides a strong foundation for this workshop.')
    }

    if (
      answers.tradingExposure === 'Directly involved in trades, positions, PnL, scheduling, or risk'
    ) {
      positiveFactors.push('Your hands-on experience with core trading workflows demonstrates practical understanding of the domain.')
    }


    if (answers.comfortLevel === 'Comfortable with numbers, logic, and complex systems') {
      positiveFactors.push('Your strong comfort with technical and quantitative work is well-suited for ETRM roles.')
    }

    if (answers.primaryReason === 'Accelerate my career within energy/commodity trading' ||
        answers.primaryReason === 'Transition into ETRM/CTRM roles with practical grounding') {
      positiveFactors.push('Your clear career goals and intent to apply the learning directly align with the workshop\'s objectives.')
    }

    if (answers.etrmExperience === '2-5 years' || answers.etrmExperience === '> 5 years') {
      positiveFactors.push('Your relevant ETRM or related field experience positions you well to benefit from and contribute to the training.')
    }

    // Caution factors
    if (answers.etrmExperience === '0-2 years' && answers.overallExperience === '0-2 years') {
      cautionFactors.push('Your limited overall and ETRM-specific experience may require additional effort to keep pace with the intensive curriculum.')
    }

    if (answers.tradingExposure === 'No exposure so far' || answers.tradingExposure === 'Only theoretical / academic exposure') {
      cautionFactors.push('Your minimal exposure to trading workflows means you may need to invest extra time to build practical context for the concepts covered.')
    }

    if (answers.comfortLevel === 'Average comfort; I can learn with effort' ||
        answers.comfortLevel === 'Prefer qualitative / conceptual work') {
      cautionFactors.push('You may need additional support with quantitative and technical concepts, as ETRM roles require comfort with data and systems.')
    }


    // Determine recommendation
    if (cautionFactors.length >= 3 || (cautionFactors.length >= 2 && positiveFactors.length <= 1)) {
      recommendation = 'Borderline'
    } else if (positiveFactors.length >= 3 && cautionFactors.length <= 1) {
      recommendation = 'Strong Fit'
    } else {
      recommendation = 'Borderline'
    }

    // Build reasons list
    const resultReasons: string[] = []
    if (positiveFactors.length > 0) {
      resultReasons.push(...positiveFactors)
    }
    if (cautionFactors.length > 0 && recommendation === 'Borderline') {
      resultReasons.push(...cautionFactors)
    }

    return {
      eligible: true,
      recommendation,
      reasons: resultReasons.length > 0 ? resultReasons : [
        'You meet the basic eligibility criteria for ETRM training.',
        'Your background and experience suggest potential for success in ETRM-related roles.',
        'The workshop is designed to build on your existing foundation and accelerate your career in energy trading and risk management.',
      ],
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const eligibilityResult = calculateEligibility()
    setResult(eligibilityResult)
    setShowResult(true)

    // Send email with form details and result
    try {
      const response = await fetch('/api/send-eligibility-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          result: eligibilityResult,
          userEmail: answers.email,
        }),
      })

      if (!response.ok) {
        console.error('Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
    }
  }

  const handleReset = () => {
    setAnswers({
      currentStatus: 'Consultant / IT / implementation supporting trading systems',
      tradingExposure: 'Support trading desks indirectly (IT, data, compliance, ops)',
      targetRole: '',
      comfortLevel: 'Comfortable with numbers, logic, and complex systems',
      primaryReason: 'Accelerate my career within energy/commodity trading',
      country: '',
      workPermit: '',
      overallExperience: '',
      etrmExperience: '',
      email: '',
    })
    setResult(null)
    setShowResult(false)
    setCurrentStep(0)
    localStorage.removeItem('etrm-quiz-answers')
  }

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const allAnswered = 
    answers.currentStatus !== '' &&
    answers.tradingExposure !== '' &&
    answers.comfortLevel !== '' &&
    answers.primaryReason !== '' &&
    answers.country !== '' &&
    answers.workPermit !== '' &&
    answers.overallExperience !== '' &&
    answers.etrmExperience !== '' &&
    isValidEmail(answers.email)

  const getEmailBody = (): string => {
    return `Dear LearnETRM Team,

I am interested in participating in the ETRM workshop.

Here are my details:
- Email: ${answers.email}
- Current Status: ${answers.currentStatus}
- Trading Exposure: ${answers.tradingExposure}
- Country: ${answers.country}
- Overall Experience: ${answers.overallExperience}
- ETRM Experience: ${answers.etrmExperience}

I look forward to hearing from you.

Best regards`
  }

  const getMailtoLink = (): string => {
    const subject = encodeURIComponent('Interested in workshop')
    const body = encodeURIComponent(getEmailBody())
    return `mailto:apexetrm@gmail.com?subject=${subject}&body=${body}`
  }

  const renderQuestion = () => {
    const question = getCurrentQuestion()
    if (!question) return null

    const field = question.field
    const value = answers[field]

    if (field === 'email') {
      return (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <label htmlFor={field} className="block text-sm font-semibold text-gray-900 mb-2">
            {question.label} {question.required && <span className="text-blue-600">*</span>}
          </label>
          <p className="text-xs text-gray-600 mb-4">
            {question.description}
          </p>
          <input
            type="email"
            id={field}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            required={question.required}
            className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-all duration-200 hover:border-gray-400 ${
              value && !isValidEmail(value) 
                ? 'border-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="your.email@example.com"
          />
          {value && !isValidEmail(value) && (
            <p className="text-xs text-red-500 mt-2">Please enter a valid email address</p>
          )}
        </div>
      )
    }

    // Render select dropdowns for other fields
    let options: JSX.Element[] = []
    
    if (field === 'currentStatus') {
      options = [
        <option key="" value="">Select an option...</option>,
        <option key="1" value="Working in energy trading / commodities / power / gas / fuels">
          Working in energy trading / commodities / power / gas / fuels
        </option>,
        <option key="2" value="Working in finance / risk / analytics / operations (non-energy)">
          Working in finance / risk / analytics / operations (non-energy)
        </option>,
        <option key="3" value="Consultant / IT / implementation supporting trading systems">
          Consultant / IT / implementation supporting trading systems
        </option>,
        <option key="4" value="Student / recent graduate (quant/finance/engineering)">
          Student / recent graduate (quant/finance/engineering)
        </option>,
        <option key="5" value="Working professional in an unrelated field">
          Working professional in an unrelated field
        </option>,
        <option key="6" value="Not currently working">Not currently working</option>,
      ]
    } else if (field === 'tradingExposure') {
      options = [
        <option key="" value="">Select an option...</option>,
        <option key="1" value="Directly involved in trades, positions, PnL, scheduling, or risk">
          Directly involved in trades, positions, PnL, scheduling, or risk
        </option>,
        <option key="2" value="Work with trading data, reports, or downstream systems">
          Work with trading data, reports, or downstream systems
        </option>,
        <option key="3" value="Support trading desks indirectly (IT, data, compliance, ops)">
          Support trading desks indirectly (IT, data, compliance, ops)
        </option>,
        <option key="4" value="Only theoretical / academic exposure">
          Only theoretical / academic exposure
        </option>,
        <option key="5" value="No exposure so far">No exposure so far</option>,
      ]
    } else if (field === 'comfortLevel') {
      options = [
        <option key="" value="">Select an option...</option>,
        <option key="1" value="Comfortable with numbers, logic, and complex systems">
          Comfortable with numbers, logic, and complex systems
        </option>,
        <option key="2" value="Comfortable with numbers but new to large systems">
          Comfortable with numbers but new to large systems
        </option>,
        <option key="3" value="Average comfort; I can learn with effort">
          Average comfort; I can learn with effort
        </option>,
        <option key="4" value="Prefer qualitative / conceptual work">
          Prefer qualitative / conceptual work
        </option>,
        <option key="5" value="I actively avoid numbers and technical topics">
          I actively avoid numbers and technical topics
        </option>,
      ]
    } else if (field === 'primaryReason') {
      options = [
        <option key="" value="">Select an option...</option>,
        <option key="1" value="Accelerate my career within energy/commodity trading">
          Accelerate my career within energy/commodity trading
        </option>,
        <option key="2" value="Transition into ETRM/CTRM roles with practical grounding">
          Transition into ETRM/CTRM roles with practical grounding
        </option>,
        <option key="3" value="Strengthen on-the-job performance in my current role">
          Strengthen on-the-job performance in my current role
        </option>,
        <option key="4" value="General interest in learning and development">
          General interest in learning and development
        </option>,
      ]
    } else if (field === 'country') {
      options = [
        <option key="" value="">Select a country...</option>,
        ...ALL_COUNTRIES.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        )),
      ]
    } else if (field === 'workPermit') {
      options = [
        <option key="" value="">Select an option...</option>,
        <option key="yes" value="Yes">Yes</option>,
        <option key="no" value="No">No</option>,
      ]
    } else if (field === 'overallExperience' || field === 'etrmExperience') {
      options = [
        <option key="" value="">Select an option...</option>,
        <option key="1" value="0-2 years">0-2 years</option>,
        <option key="2" value="2-5 years">2-5 years</option>,
        <option key="3" value="> 5 years">&gt; 5 years</option>,
      ]
    }

    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <label htmlFor={field} className="block text-sm font-semibold text-gray-900 mb-2">
          {question.label} {question.required && <span className="text-blue-600">*</span>}
        </label>
        <p className="text-xs text-gray-600 mb-4">
          {question.description}
        </p>
        <select
          id={field}
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          required={question.required}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-all duration-200 hover:border-gray-400"
        >
          {options}
        </select>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10 text-center text-white">
            <h1 className="text-3xl sm:text-4xl font-semibold mb-2 tracking-tight">
              Check if I am eligible
            </h1>
            <p className="text-blue-100 text-base sm:text-lg">
              Determine your eligibility for the LearnETRM workshop
            </p>
          </div>

          {!showResult ? (
            <form onSubmit={handleSubmit} className="p-8 sm:p-10">
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-end mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {Math.round(((currentStep + 1) / totalSteps) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Question */}
              <div className="mb-8">
                {renderQuestion()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                {!isFirstStep && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-8 py-3.5 rounded-lg font-semibold text-sm tracking-wide bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 border border-gray-300"
                  >
                    ← Previous
                  </button>
                )}
                {!isLastStep ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className={`flex-1 px-8 py-3.5 rounded-lg font-semibold text-sm tracking-wide transition-all duration-200 ${
                      canProceed()
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!canProceed()}
                    className={`flex-1 px-8 py-3.5 rounded-lg font-semibold text-sm tracking-wide transition-all duration-200 ${
                      canProceed()
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Check Availability
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-8 py-3.5 rounded-lg font-semibold text-sm tracking-wide bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 border border-gray-300"
                >
                  Reset
                </button>
              </div>
            </form>
          ) : null}

          {/* Results Section */}
          {showResult && result && (
            <div className={`mt-8 p-8 rounded-lg border-2 ${
              result.eligible
                ? result.recommendation === 'Strong Fit'
                  ? 'bg-blue-50 border-blue-500 shadow-lg'
                  : 'bg-gray-50 border-gray-300 shadow-lg'
                : 'bg-gray-50 border-gray-300 shadow-lg'
            }`}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Recommendation
                </h2>
                {!result.eligible ? (
                  <p className="text-base text-gray-700 leading-relaxed mb-6">
                    Unfortunately, based on your responses, we would not recommend participating in this workshop at this stage.
                  </p>
                ) : result.recommendation ? (
                  <p className="text-base text-gray-700 leading-relaxed mb-6">
                    {result.recommendation === 'Strong Fit' 
                      ? 'Based on your responses, you appear to be a strong fit for this workshop.'
                      : result.recommendation === 'Borderline'
                      ? 'Based on your responses, you may be a fit for this workshop, though there are some considerations to keep in mind.'
                      : 'Based on your responses, we would not recommend participating in this workshop at this stage.'}
                  </p>
                ) : null}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Reasoning</h3>
                <ul className="space-y-3">
                  {result.reasons.map((reason, idx) => (
                    <li key={idx} className="text-sm text-gray-700 leading-relaxed flex items-start gap-3">
                      <span className="text-blue-600 mt-1.5 font-bold">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Details Section */}
              <div className="mt-8 pt-8 border-t border-gray-300">
                {result.eligible ? (
                  <>
                    <p className="text-base font-semibold text-gray-900 mb-2 text-center">
                      Congratulations! You are eligible!
                    </p>
                    <p className="text-sm text-gray-600 mb-4 text-center">
                      We will send the details of the workshop to you shortly to your email id ({answers.email})
                    </p>
                    <p className="text-sm text-gray-700 mb-4 text-center font-medium">
                      In case you have any queries meanwhile, you can reach us on:
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-700 mb-4 text-center font-medium">
                    However, we appreciate grit and curiosity. Therefore, if you still have that and want some guidance, you can reach us on:
                  </p>
                )}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-sm text-gray-600 font-medium">Email:</span>
                    <a href="mailto:apexetrm@gmail.com" className="text-sm text-blue-600 hover:text-blue-700 underline">
                      apexetrm@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-sm text-gray-600 font-medium">Call:</span>
                    <a href="tel:+491734097870" className="text-sm text-blue-600 hover:text-blue-700 underline">
                      +49 17340 97870
                    </a>
                  </div>
                </div>
                <div className="flex justify-center">
                  <a
                    href="https://wa.me/491734097870"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-3.5 rounded-lg font-semibold text-sm tracking-wide bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 text-center"
                  >
                    💬 WHATSAPP
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="px-8 pb-8 pt-6 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 italic text-center">
              This is not legal immigration advice; work authorization is self-declared.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

