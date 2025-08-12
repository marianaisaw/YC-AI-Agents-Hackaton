import { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '../components/AppShell.jsx'
import { generateInvestorsWithAnthropic, generatePitchDeckWithAnthropic, generateMarketResearchWithAnthropic } from '../lib/anthropic.js'
import { SlideViewer } from '../components/SlideViewer.jsx'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const sections = [
  {
    key: 'profile',
    title: 'Profile',
    description:
      'All your startup details from onboarding, neatly organized. Update anytime to keep your AI operator aligned.',
  },
  {
    key: 'market',
    title: 'Market analysis',
    description:
      'Get crisp market maps, ICP, competitive breakdown, and pricing guidance tailored to your segment.',
  },
  {
    key: 'pitch',
    title: 'Pitch deck',
    description:
      'Auto-draft slides from your problem, solution, traction, and market. Tweak narrative and export to PDF.',
  },
  {
    key: 'connections',
    title: 'Find investors',
    description:
      'Discover warm intros to relevant investors and potential customers via your LinkedIn graph and our network.',
  },
  {
    key: 'content',
    title: 'Branding',
    description:
      'Generate your brand kit plus content calendar for launch on X, LinkedIn, and email with your chosen tone.',
  },
]

function useProfile() {
  return useMemo(() => {
    try {
      const raw = sessionStorage.getItem('glowup-profile')
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }, [])
}

export function Dashboard() {
  const profile = useProfile()
  const [active, setActive] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [investors, setInvestors] = useState([])
  const [error, setError] = useState('')
  const [pitchSlides, setPitchSlides] = useState([])
  const [pitchLoading, setPitchLoading] = useState(false)
  const [pitchError, setPitchError] = useState('')
  const [showSlideViewer, setShowSlideViewer] = useState(false)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  
  // Market Research State
  const [marketResearch, setMarketResearch] = useState(null)
  const [marketResearchLoading, setMarketResearchLoading] = useState(false)
  const [marketResearchError, setMarketResearchError] = useState('')
  const [pdfGenerating, setPdfGenerating] = useState(false)

  // Branding Calendar State
  const [brandingCalendar, setBrandingCalendar] = useState(null)
  const [brandingLoading, setBrandingLoading] = useState(false)
  const [brandingError, setBrandingError] = useState('')
  
  // API Key State
  const [apiKey, setApiKey] = useState(sessionStorage.getItem('anthropic-api-key') || '')
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey)
  
  // Pre-populate API key if not set (for development/demo purposes)
  useEffect(() => {
    if (!apiKey && !sessionStorage.getItem('anthropic-api-key')) {
      // Check for environment variable or use placeholder
      const envKey = import.meta.env.VITE_ANTHROPIC_API_KEY
      console.log('Environment API Key:', envKey ? 'Present' : 'Missing')
      console.log('API Key length:', envKey ? envKey.length : 0)
      
      // Temporary: Use the known working API key for testing
      const workingKey = null // Set your API key here for testing
      
      if (envKey && envKey.startsWith('sk-ant-api03-') && envKey !== 'sk-ant-api03-REPLACE_WITH_YOUR_ACTUAL_KEY_HERE') {
        console.log('Setting API key from environment')
        setApiKey(envKey)
        sessionStorage.setItem('anthropic-api-key', envKey)
        window.ANTHROPIC_API_KEY = envKey
        setShowApiKeyInput(false)
      } else if (workingKey && workingKey.startsWith('sk-ant-api03-')) {
        console.log('Using working API key for testing')
        setApiKey(workingKey)
        sessionStorage.setItem('anthropic-api-key', workingKey)
        window.ANTHROPIC_API_KEY = workingKey
        setShowApiKeyInput(false)
      } else {
        console.log('No valid environment key, showing input')
        // Show API key input if no valid key is found
        setShowApiKeyInput(true)
      }
    }
  }, [apiKey])

  const goToNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % pitchSlides.length)
  }

  const goToPreviousSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + pitchSlides.length) % pitchSlides.length)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (pitchSlides.length === 0) return
      
      if (event.key === 'ArrowLeft') {
        goToPreviousSlide()
      } else if (event.key === 'ArrowRight') {
        goToNextSlide()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pitchSlides.length])

  // Generate branding calendar
  const generateBrandingCalendar = () => {
    if (!profile?.startupName || !profile?.brandTone || !profile?.problem) {
      setBrandingError('Please complete your startup profile with startup name, brand tone, and problem statement first')
      return
    }

    setBrandingError('')
    setBrandingLoading(true)
    
    // Simulate API call delay for demo
    setTimeout(() => {
      const calendar = createBrandingCalendar(profile)
      setBrandingCalendar(calendar)
      setBrandingLoading(false)
    }, 2000)
  }

  // Create branding calendar data
  const createBrandingCalendar = (profile) => {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    // Get the next month
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const calendar = {
      month: monthNames[nextMonth],
      year: nextMonthYear,
      startupName: profile.startupName,
      brandTone: profile.brandTone,
      problem: profile.problem,
      solution: profile.solution,
      weeks: []
    }

    // Generate 4 weeks of content
    for (let week = 1; week <= 4; week++) {
      const weekData = {
        weekNumber: week,
        theme: getWeekTheme(week, profile.brandTone),
        posts: []
      }

      // Generate 3-4 posts per week
      const postsPerWeek = week === 1 ? 4 : 3 // First week gets more posts for launch
      for (let post = 1; post <= postsPerWeek; post++) {
        weekData.posts.push(generatePost(post, week, profile))
      }

      calendar.weeks.push(weekData)
    }

    return calendar
  }

  const getWeekTheme = (week, brandTone) => {
    const themes = {
      'Professional': ['Problem Awareness', 'Solution Showcase', 'Industry Insights', 'Company Milestones'],
      'Friendly': ['Community Building', 'Behind the Scenes', 'Customer Stories', 'Team Culture'],
      'Innovative': ['Future Vision', 'Tech Deep Dives', 'Trend Analysis', 'Innovation Stories'],
      'Luxury': ['Premium Positioning', 'Exclusive Insights', 'Quality Focus', 'Brand Heritage'],
      'Casual': ['Daily Life', 'Fun Facts', 'User Stories', 'Relatable Content']
    }
    
    return themes[brandTone]?.[week - 1] || themes['Professional'][week - 1]
  }

  const generatePost = (postNumber, week, profile) => {
    const postTypes = ['LinkedIn', 'Instagram']
    const postType = postTypes[Math.floor(Math.random() * postTypes.length)]
    
    const postTemplates = {
      'LinkedIn': [
        {
          title: `How ${profile.startupName} is solving ${profile.problem}`,
          content: `🚀 Excited to share how we're tackling one of the biggest challenges in our industry. ${profile.problem} affects millions, and we're building the solution. #Innovation #Startup #ProblemSolving`,
          hashtags: ['#Innovation', '#Startup', '#ProblemSolving', '#Tech', '#Future'],
          platform: 'LinkedIn',
          engagement: 'High',
          timing: '9:00 AM',
          day: getDayOfWeek(week, postNumber)
        },
        {
          title: `Behind the scenes at ${profile.startupName}`,
          content: `💡 Ever wondered what goes into building a game-changing solution? Here's a peek into our development process and the team making it happen. #BehindTheScenes #TeamWork #Innovation`,
          hashtags: ['#BehindTheScenes', '#TeamWork', '#Innovation', '#StartupLife', '#Building'],
          platform: 'LinkedIn',
          engagement: 'Medium',
          timing: '2:00 PM',
          day: getDayOfWeek(week, postNumber)
        },
        {
          title: `Industry insights: The future of our space`,
          content: `🔮 We're not just building a product, we're shaping the future. Here's what we see coming in the next 5 years and how ${profile.startupName} fits into that vision. #FutureOfTech #IndustryInsights #Innovation`,
          hashtags: ['#FutureOfTech', '#IndustryInsights', '#Innovation', '#Trends', '#Vision'],
          platform: 'LinkedIn',
          engagement: 'High',
          timing: '11:00 AM',
          day: getDayOfWeek(week, postNumber)
        },
        {
          title: `Customer success story`,
          content: `🎉 Nothing makes us happier than seeing our solution make a real difference. Here's how we helped one customer overcome ${profile.problem} and achieve their goals. #CustomerSuccess #Impact #Results`,
          hashtags: ['#CustomerSuccess', '#Impact', '#Results', '#Testimonial', '#Success'],
          platform: 'LinkedIn',
          engagement: 'High',
          timing: '3:00 PM',
          day: getDayOfWeek(week, postNumber)
        }
      ],
      'Instagram': [
        {
          title: `Visual story: Our journey so far`,
          content: `📸 From idea to reality - here's the visual story of how ${profile.startupName} came to life. Swipe to see our evolution! #StartupJourney #VisualStory #Innovation`,
          hashtags: ['#StartupJourney', '#VisualStory', '#Innovation', '#BehindTheScenes', '#Story'],
          platform: 'Instagram',
          engagement: 'High',
          timing: '12:00 PM',
          day: getDayOfWeek(week, postNumber)
        },
        {
          title: `Team spotlight`,
          content: `👥 Meet the amazing people behind ${profile.startupName}! Every great solution starts with a great team. #TeamSpotlight #StartupTeam #Innovation`,
          hashtags: ['#TeamSpotlight', '#StartupTeam', '#Innovation', '#People', '#Culture'],
          platform: 'Instagram',
          engagement: 'Medium',
          timing: '6:00 PM',
          day: getDayOfWeek(week, postNumber)
        },
        {
          title: `Product showcase`,
          content: `✨ Here's what we've been building! ${profile.startupName} in action, solving ${profile.problem} one step at a time. #ProductShowcase #Innovation #Solution`,
          hashtags: ['#ProductShowcase', '#Innovation', '#Solution', '#Tech', '#Product'],
          platform: 'Instagram',
          engagement: 'High',
          timing: '10:00 AM',
          day: getDayOfWeek(week, postNumber)
        }
      ]
    }

    const template = postTemplates[postType][Math.floor(Math.random() * postTemplates[postType].length)]
    return {
      ...template,
      id: `week${week}-post${postNumber}`,
      week: week,
      postNumber: postNumber
    }
  }

  const getDayOfWeek = (week, postNumber) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const startDay = (week - 1) * 7
    return days[(startDay + postNumber - 1) % 7]
  }

  // PDF Export Function for Market Research
  const exportMarketResearchToPDF = async () => {
    if (!marketResearch) return
    
    setPdfGenerating(true)
    
    try {
      // Create a temporary container for the PDF content
      const pdfContainer = document.createElement('div')
      pdfContainer.style.position = 'absolute'
      pdfContainer.style.left = '-9999px'
      pdfContainer.style.top = '0'
      pdfContainer.style.width = '800px'
      pdfContainer.style.backgroundColor = 'white'
      pdfContainer.style.color = 'black'
      pdfContainer.style.padding = '40px'
      pdfContainer.style.fontFamily = 'Arial, sans-serif'
      pdfContainer.style.lineHeight = '1.6'
      
      // Generate the PDF content
      pdfContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 32px; color: #1f2937; margin-bottom: 10px; font-family: 'Arial Black', sans-serif;">
            ${profile?.startupName || 'Startup'} Market Analysis
          </h1>
          <h2 style="font-size: 20px; color: #6b7280; margin-bottom: 5px;">
            Executive Summary & Strategic Insights
          </h2>
          <p style="font-size: 14px; color: #9ca3af;">
            Generated on ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 24px; color: #1f2937; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Executive Summary
          </h2>
          <p style="font-size: 16px; color: #374151; line-height: 1.8;">
            ${marketResearch.executive_summary}
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 24px; color: #1f2937; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Market Analysis
          </h2>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 18px; color: #374151; margin-bottom: 10px;">Market Size & Growth</h3>
            <p style="font-size: 14px; color: #6b7280;">${marketResearch.market_analysis?.market_size || 'N/A'}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 18px; color: #374151; margin-bottom: 10px;">Industry Trends</h3>
            <p style="font-size: 14px; color: #6b7280;">${marketResearch.market_analysis?.industry_trends || 'N/A'}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 18px; color: #374151; margin-bottom: 10px;">Market Segmentation</h3>
            <p style="font-size: 14px; color: #6b7280;">${marketResearch.market_analysis?.market_segmentation || 'N/A'}</p>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 24px; color: #1f2937; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Competitive Landscape
          </h2>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 18px; color: #374151; margin-bottom: 10px;">Key Competitors</h3>
            <p style="font-size: 14px; color: #6b7280;">${marketResearch.competitive_landscape?.key_competitors || 'N/A'}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 18px; color: #374151; margin-bottom: 10px;">Competitive Advantages</h3>
            <p style="font-size: 14px; color: #6b7280;">${marketResearch.competitive_landscape?.competitive_advantages || 'N/A'}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 18px; color: #374151; margin-bottom: 10px;">Market Share Dynamics</h3>
            <p style="font-size: 14px; color: #6b7280;">${marketResearch.competitive_landscape?.market_share || 'N/A'}</p>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 24px; color: #1f2937; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Customer Intelligence
          </h2>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 18px; color: #374151; margin-bottom: 10px;">Target Customers</h3>
            <p style="font-size: 14px; color: #6b7280;">${marketResearch.customer_insights?.target_customers || 'N/A'}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 18px; color: #374151; margin-bottom: 10px;">Pain Points</h3>
            <p style="font-size: 14px; color: #6b7280;">${marketResearch.customer_insights?.pain_points || 'N/A'}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 18px; color: #374151; margin-bottom: 10px;">Customer Behavior</h3>
            <p style="font-size: 14px; color: #6b7280;">${marketResearch.customer_insights?.behavior || 'N/A'}</p>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 24px; color: #1f2937; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Market Opportunity
          </h2>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 18px; color: #374151; margin-bottom: 10px;">Market Gaps</h3>
            <p style="font-size: 14px; color: #6b7280;">${marketResearch.market_opportunity?.market_gaps || 'N/A'}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 18px; color: #374151; margin-bottom: 10px;">Revenue Potential</h3>
            <p style="font-size: 14px; color: #6b7280;">${marketResearch.market_opportunity?.revenue_potential || 'N/A'}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 18px; color: #374151; margin-bottom: 10px;">Entry Barriers</h3>
            <p style="font-size: 14px; color: #6b7280;">${marketResearch.market_opportunity?.entry_barriers || 'N/A'}</p>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 24px; color: #1f2937; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Strategic Recommendations
          </h2>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 18px; color: #374151; margin-bottom: 10px;">Strategic Direction</h3>
            <p style="font-size: 14px; color: #6b7280;">${marketResearch.recommendations?.strategic || 'N/A'}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 18px; color: #374151; margin-bottom: 10px;">Implementation Plan</h3>
            <p style="font-size: 14px; color: #6b7280;">${marketResearch.recommendations?.implementation || 'N/A'}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 18px; color: #374151; margin-bottom: 10px;">Risk Mitigation</h3>
            <p style="font-size: 14px; color: #6b7280;">${marketResearch.recommendations?.risk_mitigation || 'N/A'}</p>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 24px; color: #1f2937; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Strategic Conclusion
          </h2>
          <p style="font-size: 16px; color: #374151; line-height: 1.8;">
            ${marketResearch.conclusion}
          </p>
        </div>

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <p style="font-size: 12px; color: #9ca3af;">
            This market intelligence report was generated using advanced AI analysis and is intended for executive decision-making.
          </p>
        </div>
      `
      
      // Add to DOM temporarily
      document.body.appendChild(pdfContainer)
      
      // Convert to canvas
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })
      
      // Remove temporary container
      document.body.removeChild(pdfContainer)
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      // Download PDF
      const fileName = `${profile?.startupName || 'Startup'}_Market_Research_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
    } catch (error) {
      console.error('PDF generation error:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setPdfGenerating(false)
    }
  }

  return (
    <AppShell>
      <div className="grid md:grid-cols-12 gap-6">
        <aside className="md:col-span-3 lg:col-span-2 glass rounded-2xl p-2">
          {sections.map((s) => (
            <button
              key={s.key}
              className={
                'w-full text-left px-4 py-4 rounded-xl transition mb-3 ' +
                (active === s.key
                  ? 'bg-purple-400/10 border border-purple-400/20'
                  : 'hover:bg-white/5')
              }
              onClick={() => setActive(s.key)}
            >
              <div className="font-medium">{s.title}</div>
            </button>
          ))}
        </aside>

        <section className="md:col-span-9 lg:col-span-10 grid gap-6">
          <div className="glass rounded-2xl p-6 md:p-8">
            <AnimatePresence mode="wait">
              {sections.map((s) => (
                active === s.key && (
                  <motion.div
                    key={s.key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="section-title mb-2">{s.title}</div>
                    <p className="subtle max-w-2xl">{s.description}</p>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>

          {active === 'profile' && (
            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="text-xl mb-4" style={{fontFamily:'Space Grotesk, ui-sans-serif, system-ui'}}>Startup profile</div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <Field label="Startup name" value={profile.startupName || '—'} />
                <Field label="Brand tone" value={profile.brandTone || '—'} />
                <Field label="LinkedIn" value={profile.linkedin || '—'} />
                <Field label="Problem" value={profile.problem || '—'} />
                <Field label="Solution" value={profile.solution || '—'} />
                <Field label="Launch timeframe" value={profile.launchWeeks ? `${profile.launchWeeks} weeks` : '—'} />
                <Field label="Milestones" value={profile.milestones || '—'} full />
                <Field label="Extra notes" value={profile.notes || '—'} full />
              </div>
              
              {/* API Key Input Section */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="text-lg mb-4" style={{fontFamily:'Space Grotesk, ui-sans-serif, system-ui'}}>AI Configuration</div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="label mb-2">Anthropic API Key</div>
                    {showApiKeyInput ? (
                      <div className="space-y-3">
                        <input
                          type="password"
                          className="input"
                          placeholder="sk-ant-api03-..."
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            className="btn-primary text-sm px-4 py-2"
                            onClick={() => {
                              if (apiKey.trim()) {
                                sessionStorage.setItem('anthropic-api-key', apiKey.trim())
                                setShowApiKeyInput(false)
                                window.ANTHROPIC_API_KEY = apiKey.trim()
                              }
                            }}
                          >
                            Save Key
                          </button>
                          <button
                            className="btn-ghost text-sm px-4 py-2"
                            onClick={() => {
                              setApiKey('')
                              setShowApiKeyInput(true)
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                          {apiKey.substring(0, 8)}...{apiKey.substring(apiKey.length - 4)}
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="btn-ghost text-sm px-4 py-2"
                            onClick={() => setShowApiKeyInput(true)}
                          >
                            Change Key
                          </button>
                          <button
                            className="btn-ghost text-sm px-4 py-2 text-red-400 hover:text-red-300"
                            onClick={() => {
                              sessionStorage.removeItem('anthropic-api-key')
                              setApiKey('')
                              setShowApiKeyInput(true)
                              window.ANTHROPIC_API_KEY = ''
                            }}
                          >
                            Remove Key
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-white/60">
                    <div className="font-medium mb-2">🔑 API Key Required</div>
                    <p>Your Anthropic API key is needed to generate AI content. It's stored securely in your browser session and never sent to our servers.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === 'content' && (
            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="text-center mb-8">
                <div className="text-3xl font-bold text-white mb-2" style={{fontFamily:'Space Grotesk, ui-sans-serif, system-ui'}}>
                  Brand Content Calendar
                </div>
                <div className="text-lg text-white/70 mb-4">
                  Strategic Social Media & Content Planning for {profile?.startupName || 'Your Startup'}
                </div>
                <div className="text-sm text-purple-400 font-medium">
                  AI-Powered Content Strategy Aligned with Your Brand Voice
                </div>
              </div>

              {/* Generate Button - Centered and Prominent */}
              <div className="text-center mb-8">
                <button
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-pink-400/30"
                  onClick={generateBrandingCalendar}
                  disabled={brandingLoading}
                >
                  {brandingLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Generating Your Content Calendar...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Generate Content Calendar</span>
                    </div>
                  )}
                </button>
                
                {!brandingLoading && !brandingCalendar && !brandingError && (
                  <div className="text-white/60 text-sm mt-4">
                    Click above to generate a comprehensive content calendar based on your startup profile and brand tone
                  </div>
                )}
              </div>

              {/* Error Display */}
              {brandingError && (
                <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-4 text-center mb-6">
                  <div className="text-pink-400 font-medium mb-2">⚠️ Generation Failed</div>
                  <div className="text-white/80 text-sm">{brandingError}</div>
                </div>
              )}

              {/* Branding Calendar Results */}
              {brandingCalendar && (
                <div className="space-y-8">
                  {/* Calendar Header */}
                  <div className="bg-gradient-to-r from-pink-800/50 to-purple-900/50 rounded-3xl p-8 border border-pink-500/30">
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-white mb-2" style={{fontFamily:'Space Grotesk, ui-sans-serif, system-ui'}}>
                        {brandingCalendar.month} {brandingCalendar.year} Content Calendar
                      </div>
                      <div className="text-xl text-white/80 font-medium">
                        {brandingCalendar.startupName} • {brandingCalendar.brandTone} Brand Tone
                      </div>
                      <div className="text-sm text-pink-400 mt-2">
                        Strategic content planning for LinkedIn & Instagram
                      </div>
                    </div>
                  </div>

                  {/* Weekly Calendar Grid */}
                  <div className="grid gap-8">
                    {brandingCalendar.weeks.map((week, weekIndex) => (
                      <div key={week.weekNumber} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-8 border border-slate-600/30">
                        {/* Week Header */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">W{week.weekNumber}</span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">Week {week.weekNumber}</h3>
                            <p className="text-pink-300 text-lg font-medium">{week.theme}</p>
                          </div>
                        </div>

                        {/* Posts Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {week.posts.map((post, postIndex) => (
                            <motion.div
                              key={post.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: postIndex * 0.1 }}
                              className={`rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 ${
                                post.platform === 'LinkedIn' 
                                  ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-blue-500/30' 
                                  : 'bg-gradient-to-br from-pink-900/30 to-purple-800/30 border-pink-500/30'
                              }`}
                            >
                              {/* Platform Badge */}
                              <div className="flex items-center justify-between mb-4">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  post.platform === 'LinkedIn' 
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' 
                                    : 'bg-pink-500/20 text-pink-300 border border-pink-400/30'
                                }`}>
                                  {post.platform}
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  post.engagement === 'High' 
                                    ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                                }`}>
                                  {post.engagement}
                                </div>
                              </div>

                              {/* Post Title */}
                              <h4 className="text-white font-bold text-lg mb-3 leading-tight">
                                {post.title}
                              </h4>

                              {/* Post Content */}
                              <p className="text-white/80 text-sm mb-4 leading-relaxed">
                                {post.content}
                              </p>

                              {/* Post Details */}
                              <div className="space-y-3">
                                {/* Timing */}
                                <div className="flex items-center gap-2 text-xs text-white/60">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>{post.day} • {post.timing}</span>
                                </div>

                                {/* Hashtags */}
                                <div className="flex flex-wrap gap-1">
                                  {post.hashtags.slice(0, 3).map((tag, tagIndex) => (
                                    <span key={tagIndex} className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70 border border-white/20">
                                      {tag}
                                    </span>
                                  ))}
                                  {post.hashtags.length > 3 && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/50 border border-white/20">
                                      +{post.hashtags.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Strategic Insights */}
                  <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-3xl p-8 border border-indigo-500/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Content Strategy Insights</h3>
                        <p className="text-indigo-300 text-sm">Key Recommendations for Your Brand</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <div className="text-indigo-400 text-sm font-bold mb-3 uppercase tracking-wider">Content Mix</div>
                        <div className="text-white/90 text-base leading-relaxed">
                          Balanced mix of {brandingCalendar.brandTone.toLowerCase()} content with {brandingCalendar.weeks.reduce((acc, week) => acc + week.posts.length, 0)} posts over 4 weeks, 
                          focusing on {brandingCalendar.problem} and solution storytelling.
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <div className="text-indigo-400 text-sm font-bold mb-3 uppercase tracking-wider">Engagement Strategy</div>
                        <div className="text-white/90 text-base leading-relaxed">
                          High-engagement posts scheduled during peak hours (9 AM, 12 PM, 2 PM, 6 PM) 
                          with strategic hashtag usage for maximum reach and visibility.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Calendar Footer */}
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-6 border border-slate-600/30 text-center">
                    <div className="text-white/60 text-sm">
                      This content calendar is tailored to your {brandingCalendar.brandTone} brand tone and designed to maximize engagement across LinkedIn and Instagram.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {active !== 'profile' && active !== 'connections' && active !== 'pitch' && active !== 'market' && active !== 'content' && (
            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="font-display text-xl mb-3">Coming alive</div>
              <p className="subtle">We’ll wire this to your AI operator next. For the hackathon demo, this showcases the UX and flow cleanly.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="btn-primary">Generate</button>
                <button className="btn-ghost">Configure</button>
              </div>
            </div>
          )}

                    {active === 'market' && (
            <div className="glass rounded-2xl p-6 md:p-8">
              {/* Header Section */}
              <div className="text-center mb-8">
                <div className="text-3xl font-bold text-white mb-2" style={{fontFamily:'Space Grotesk, ui-sans-serif, system-ui'}}>
                  Market Intelligence Report
                </div>
                <div className="text-lg text-white/70 mb-4">
                  Strategic Market Analysis & Competitive Intelligence
                </div>
                <div className="text-sm text-purple-400 font-medium">
                  Generated by AI-Powered Market Research Engine
                </div>
              </div>

              {/* Generate Button - Centered and Prominent */}
              <div className="text-center mb-8">
                <button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-purple-400/30"
                  onClick={async () => {
                    if (!profile?.problem) {
                      setMarketResearchError('Please complete your startup profile with a problem statement first')
                      return
                    }

                    setMarketResearchError('')
                    setMarketResearchLoading(true)
                    setMarketResearch(null)
                    
                    try {
                      const apiKey = (sessionStorage.getItem('anthropic-api-key') || window?.ANTHROPIC_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY || '').trim()
                      
                      console.log('API Key check:', { hasKey: !!apiKey, keyLength: apiKey?.length, isPlaceholder: apiKey === 'sk-ant-api03-REPLACE_WITH_YOUR_ACTUAL_KEY_HERE' })
                      
                      if (!apiKey || apiKey === 'sk-ant-api03-REPLACE_WITH_YOUR_ACTUAL_KEY_HERE') {
                        setMarketResearchError('Please enter a valid Anthropic API key in the Profile section above')
                        setMarketResearchLoading(false)
                        return
                      }
                      
                      const report = await generateMarketResearchWithAnthropic({ 
                        profile, 
                        problemStatement: profile.problem,
                        userAnswers: [],
                        apiKey 
                      })
                      setMarketResearch(report)
                    } catch (e) {
                      console.error('Market research error:', e)
                      if (e?.message?.includes('401') || e?.message?.includes('authentication_error')) {
                        setMarketResearchError('Invalid API key. Please check your Anthropic API key in the Profile section above.')
                      } else {
                        setMarketResearchError(e?.message || 'Failed to generate market research')
                      }
                    } finally {
                      setMarketResearchLoading(false)
                    }
                  }}
                  disabled={marketResearchLoading}
                >
                  {marketResearchLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Generating Executive Report...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Generate Market Intelligence Report</span>
                    </div>
                  )}
                </button>
                
                {!marketResearchLoading && !marketResearch && !marketResearchError && (
                  <div className="text-white/60 text-sm mt-4">
                    Click above to generate a comprehensive market analysis based on your startup profile
                  </div>
                )}
              </div>

              {/* Error Display */}
              {marketResearchError && (
                <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-4 text-center mb-6">
                  <div className="text-pink-400 font-medium mb-2">⚠️ Generation Failed</div>
                  <div className="text-white/80 text-sm">{marketResearchError}</div>
                </div>
              )}

              {/* Market Research Results - Professional Report Format */}
              {marketResearch && (
                <div className="space-y-8">
                  {/* Report Header */}
                  <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-3xl p-8 border border-slate-600/30">
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-white mb-2" style={{fontFamily:'Space Grotesk, ui-sans-serif, system-ui'}}>
                        {profile?.startupName || 'Startup'} Market Analysis
                      </div>
                      <div className="text-xl text-white/80 font-medium">
                        Executive Summary & Strategic Insights
                      </div>
                      <div className="text-sm text-purple-400 mt-2">
                        Generated on {new Date().toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Executive Summary - Hero Section */}
                  <div className="bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-indigo-900/30 rounded-3xl p-8 border border-blue-500/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Executive Summary</h2>
                        <p className="text-blue-300 text-sm">Key Findings & Strategic Overview</p>
                      </div>
                    </div>
                    <div className="text-white/90 text-lg leading-relaxed font-medium">
                      {marketResearch.executive_summary}
                    </div>
                  </div>

                  {/* Market Analysis Grid */}
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Market Size & Trends */}
                    <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-3xl p-8 border border-emerald-500/20">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Market Analysis</h3>
                          <p className="text-emerald-300 text-sm">Size, Growth & Trends</p>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                          <div className="text-emerald-400 text-sm font-bold mb-2 uppercase tracking-wider">Market Size & Growth</div>
                          <div className="text-white/90 text-base leading-relaxed">{marketResearch.market_analysis?.market_size}</div>
                        </div>
                        
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                          <div className="text-emerald-400 text-sm font-bold mb-2 uppercase tracking-wider">Industry Trends</div>
                          <div className="text-white/90 text-base leading-relaxed">{marketResearch.market_analysis?.industry_trends}</div>
                        </div>
                        
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                          <div className="text-emerald-400 text-sm font-bold mb-2 uppercase tracking-wider">Market Segmentation</div>
                          <div className="text-white/90 text-base leading-relaxed">{marketResearch.market_analysis?.market_segmentation}</div>
                        </div>
                      </div>
                    </div>

                    {/* Competitive Landscape */}
                    <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-3xl p-8 border border-orange-500/20">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Competitive Landscape</h3>
                          <p className="text-orange-300 text-sm">Analysis & Positioning</p>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                          <div className="text-orange-400 text-sm font-bold mb-2 uppercase tracking-wider">Key Competitors</div>
                          <div className="text-white/90 text-base leading-relaxed">{marketResearch.competitive_landscape?.key_competitors}</div>
                        </div>
                        
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                          <div className="text-orange-400 text-sm font-bold mb-2 uppercase tracking-wider">Competitive Advantages</div>
                          <div className="text-white/90 text-base leading-relaxed">{marketResearch.competitive_landscape?.competitive_advantages}</div>
                        </div>
                        
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                          <div className="text-orange-400 text-sm font-bold mb-2 uppercase tracking-wider">Market Share Dynamics</div>
                          <div className="text-white/90 text-base leading-relaxed">{marketResearch.competitive_landscape?.market_share}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Insights - Full Width */}
                  <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-3xl p-8 border border-indigo-500/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Customer Intelligence</h3>
                        <p className="text-indigo-300 text-sm">Target Segments & Behavior Analysis</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <div className="text-indigo-400 text-sm font-bold mb-3 uppercase tracking-wider">Target Customers</div>
                        <div className="text-white/90 text-base leading-relaxed">{marketResearch.customer_insights?.target_customers}</div>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <div className="text-indigo-400 text-sm font-bold mb-3 uppercase tracking-wider">Pain Points</div>
                        <div className="text-white/90 text-base leading-relaxed">{marketResearch.customer_insights?.pain_points}</div>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <div className="text-indigo-400 text-sm font-bold mb-3 uppercase tracking-wider">Customer Behavior</div>
                        <div className="text-white/90 text-base leading-relaxed">{marketResearch.customer_insights?.behavior}</div>
                      </div>
                    </div>
                  </div>

                  {/* Market Opportunity & Recommendations Grid */}
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Market Opportunity */}
                    <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-3xl p-8 border border-green-500/20">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Market Opportunity</h3>
                          <p className="text-green-300 text-sm">Gaps & Revenue Potential</p>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                          <div className="text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">Market Gaps</div>
                          <div className="text-white/90 text-base leading-relaxed">{marketResearch.market_opportunity?.market_gaps}</div>
                        </div>
                        
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                          <div className="text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">Revenue Potential</div>
                          <div className="text-white/90 text-base leading-relaxed">{marketResearch.market_opportunity?.revenue_potential}</div>
                        </div>
                        
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                          <div className="text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">Entry Barriers</div>
                          <div className="text-white/90 text-base leading-relaxed">{marketResearch.market_opportunity?.entry_barriers}</div>
                        </div>
                      </div>
                    </div>

                    {/* Strategic Recommendations */}
                    <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-3xl p-8 border border-cyan-500/20">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Strategic Recommendations</h3>
                          <p className="text-cyan-300 text-sm">Actionable Insights & Roadmap</p>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                          <div className="text-cyan-400 text-sm font-bold mb-2 uppercase tracking-wider">Strategic Direction</div>
                          <div className="text-white/90 text-base leading-relaxed">{marketResearch.recommendations?.strategic}</div>
                        </div>
                        
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                          <div className="text-cyan-400 text-sm font-bold mb-2 uppercase tracking-wider">Implementation Plan</div>
                          <div className="text-white/90 text-base leading-relaxed">{marketResearch.recommendations?.implementation}</div>
                        </div>
                        
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                          <div className="text-cyan-400 text-sm font-bold mb-2 uppercase tracking-wider">Risk Mitigation</div>
                          <div className="text-white/90 text-base leading-relaxed">{marketResearch.recommendations?.risk_mitigation}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conclusion - Hero Section */}
                  <div className="bg-gradient-to-br from-violet-900/30 via-purple-900/30 to-fuchsia-900/30 rounded-3xl p-8 border border-violet-500/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-fuchsia-600 rounded-2xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Strategic Conclusion</h3>
                        <p className="text-violet-300 text-sm">Key Insights & Next Steps</p>
                      </div>
                    </div>
                    <div className="text-white/90 text-lg leading-relaxed font-medium">
                      {marketResearch.conclusion}
                    </div>
                  </div>

                  {/* Report Footer */}
                  <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-3xl p-6 border border-slate-600/30 text-center">
                    <div className="text-white/60 text-sm mb-4">
                      This market intelligence report was generated using advanced AI analysis and is intended for executive decision-making.
                    </div>
                    
                    {/* PDF Export Button */}
                    <button
                      onClick={exportMarketResearchToPDF}
                      disabled={pdfGenerating}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-green-800 disabled:to-emerald-800 text-white font-bold py-3 px-6 rounded-2xl text-lg shadow-2xl transform hover:scale-105 disabled:scale-100 transition-all duration-300 border-2 border-green-400/30 disabled:border-green-600/30"
                    >
                      {pdfGenerating ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Generating PDF...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Turn into PDF</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {active === 'pitch' && (
            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="text-xl mb-2" style={{fontFamily:'Space Grotesk, ui-sans-serif, system-ui'}}>Pitch deck (auto‑draft)</div>
              <p className="subtle mb-4">Grounded in your profile. Clean structure. Edit after generation as needed.</p>

              <div className="flex gap-3 mb-6">
                <button
                  className="btn-primary"
                  onClick={async () => {
                    setPitchError('')
                    setPitchLoading(true)
                    setPitchSlides([])
                    setCurrentSlideIndex(0)
                    try {
                      const apiKey = (sessionStorage.getItem('anthropic-api-key') || window?.ANTHROPIC_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY || '').trim()
                      
                      if (!apiKey || apiKey === 'sk-ant-api03-REPLACE_WITH_YOUR_ACTUAL_KEY_HERE') {
                        setPitchError('Please enter a valid Anthropic API key in the Profile section above')
                        setPitchLoading(false)
                        return
                      }
                      
                      console.log('API Key:', apiKey ? 'Present' : 'Missing')
                      const slides = await generatePitchDeckWithAnthropic({ profile, apiKey })
                      console.log('Generated slides:', slides)
                      setPitchSlides(Array.isArray(slides) ? slides : [])
                    } catch (e) {
                      console.error('Pitch deck error:', e)
                      if (e?.message?.includes('401') || e?.message?.includes('authentication_error')) {
                        setPitchError('Invalid API key. Please check your Anthropic API key in the Profile section above.')
                      } else {
                        setPitchError(e?.message || 'Failed to generate pitch deck')
                      }
                    } finally {
                      setPitchLoading(false)
                    }
                  }}
                >
                  {pitchLoading ? 'Generating…' : 'Generate'}
                </button>
                <button className="btn-ghost" onClick={() => {
                  setPitchSlides([])
                  setCurrentSlideIndex(0)
                }}>Clear</button>
              </div>

              {pitchError && (
                <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-3 text-sm mb-4">{pitchError}</div>
              )}

              {/* Large Slide Display Area */}
              {pitchSlides.length > 0 && (
                <div className="mb-8">
                  <div className="text-lg font-medium mb-4 text-white/90">Slide Preview</div>
                  <div className="relative bg-gradient-to-b from-purple-300 via-purple-500 to-purple-800 rounded-3xl p-8 min-h-[600px] flex items-center justify-center">
                    {/* Brand Title */}
                    <div className="absolute top-8 left-8 text-white text-2xl font-bold">
                      {profile.startupName || 'Startup'}
                    </div>

                    {/* Slide Dots */}
                    <div className="absolute top-8 right-8 flex gap-2">
                      {pitchSlides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlideIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                            index === currentSlideIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Navigation Arrows */}
                    <button 
                      onClick={goToPreviousSlide}
                      className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border-2 border-purple-500 flex items-center justify-center hover:bg-purple-50 transition-colors"
                    >
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <button 
                      onClick={goToNextSlide}
                      className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border-2 border-purple-500 flex items-center justify-center hover:bg-purple-50 transition-colors"
                    >
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Main Slide Card */}
                    <motion.div 
                      key={currentSlideIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl border-t-4 border-pink-400"
                    >
                      {/* Slide Header */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold text-gray-800">
                            {pitchSlides[currentSlideIndex]?.title || 'Slide Title'}
                          </h1>
                          {pitchSlides[currentSlideIndex]?.subtitle && (
                            <p className="text-xl text-purple-600 font-medium">
                              {pitchSlides[currentSlideIndex]?.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Slide Content */}
                      <div className="space-y-6">
                        {/* Description */}
                        {pitchSlides[currentSlideIndex]?.subtitle && (
                          <p className="text-lg text-gray-700 leading-relaxed">
                            {pitchSlides[currentSlideIndex]?.subtitle}
                          </p>
                        )}

                        {/* Bullet Points */}
                        {pitchSlides[currentSlideIndex]?.bullets && pitchSlides[currentSlideIndex]?.bullets.length > 0 && (
                          <div className="grid grid-cols-2 gap-4">
                            {pitchSlides[currentSlideIndex]?.bullets.slice(0, 4).map((bullet, index) => (
                              <div key={index} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-gray-700 text-sm">{bullet}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Metrics */}
                        {pitchSlides[currentSlideIndex]?.metrics && typeof pitchSlides[currentSlideIndex]?.metrics === 'object' && (
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(pitchSlides[currentSlideIndex]?.metrics).slice(0, 4).map(([key, value]) => (
                              <div key={key} className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                                <div className="text-sm text-purple-600 font-medium">{key}</div>
                                <div className="text-lg text-gray-800 font-semibold">{value}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Slide Counter */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-lg font-medium">
                      {currentSlideIndex + 1}/{pitchSlides.length}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {pitchSlides.map((s, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-white/70 text-xs">Slide {s?.number || idx + 1}</div>
                          <div className="text-white font-medium">{s?.title || 'Untitled'}</div>
                        </div>
                        <div className="text-xs rounded-full px-2 py-1 bg-purple-400/15 border border-purple-400/20 text-white/80">
                          {String(s?.subtitle || '').slice(0, 24) || 'Overview'}
                        </div>
                      </div>
                      {s?.subtitle && (
                        <div className="text-white/70 text-sm mt-2">{s.subtitle}</div>
                      )}
                      <ul className="mt-3 space-y-2 list-disc list-inside text-sm text-white/90">
                        {(Array.isArray(s?.bullets) ? s.bullets : String(s?.bullets || '').split(/\n|•|\-/).filter(Boolean)).slice(0, 6).map((b, i) => (
                          <li key={i}>{String(b).trim()}</li>
                        ))}
                      </ul>
                      {s?.metrics && typeof s.metrics === 'object' && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {Object.entries(s.metrics).slice(0, 6).map(([k, v]) => (
                            <span key={k} className="text-xs rounded-full px-2 py-1 bg-white/5 border border-white/10">{k}: {String(v)}</span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {!pitchLoading && pitchSlides.length === 0 && !pitchError && (
                <div className="text-white/60 text-sm">Click Generate to draft 12 structured slides.</div>
              )}
            </div>
          )}

          {active === 'connections' && (
            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="text-xl mb-2" style={{fontFamily:'Space Grotesk, ui-sans-serif, system-ui'}}>High‑value investors</div>
              <p className="subtle mb-4">Curated to your profile. We’ll prioritize warm intros from your graph next.</p>
              <div className="flex gap-3 mb-6">
                <button
                  className="btn-primary"
                  onClick={async () => {
                    setError('')
                    setIsLoading(true)
                    setInvestors([])
                    try {
                      const apiKey = (sessionStorage.getItem('anthropic-api-key') || window?.ANTHROPIC_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY || '').trim()
                      
                      if (!apiKey || apiKey === 'sk-ant-api03-REPLACE_WITH_YOUR_ACTUAL_KEY_HERE') {
                        setError('Please enter a valid Anthropic API key in the Profile section above')
                        setIsLoading(false)
                        return
                      }
                      
                      const enrichedProfile = {
                        ...profile,
                        // Derive a rough stage hint from launchWeeks
                        stage_hint:
                          profile.launchWeeks === '1-2' || profile.launchWeeks === '5-8'
                            ? 'pre-seed'
                            : profile.launchWeeks === '5-8'
                              ? 'seed'
                              : 'seed-or-series-a',
                      }
                      const results = await generateInvestorsWithAnthropic({ profile: enrichedProfile, apiKey })
                      setInvestors(results)
                    } catch (e) {
                      if (e?.message?.includes('401') || e?.message?.includes('authentication_error')) {
                        setError('Invalid API key. Please check your Anthropic API key in the Profile section above.')
                      } else {
                        setError(e?.message || 'Failed to generate')
                      }
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                >
                  {isLoading ? 'Generating…' : 'Generate'}
                </button>
                <button className="btn-ghost" onClick={() => setInvestors([])}>Clear</button>
              </div>

              {error && <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-3 text-sm">{error}</div>}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {investors.map((inv, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-white font-medium">{inv.name || 'Unknown'}</div>
                        <div className="text-white/70 text-sm">{inv.role || ''}{inv.role && inv.firm ? ' · ' : ''}{inv.firm || ''}</div>
                      </div>
                      <div className="text-xs rounded-full px-2 py-1 bg-purple-400/15 border border-purple-400/20 text-white/80">{(inv.geo || 'Global')}</div>
                    </div>
                    {inv.why_match && <div className="text-white/80 text-sm mt-3">{inv.why_match}</div>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(inv.sectors || []).slice(0,3).map((s) => (
                        <span key={s} className="text-xs rounded-full px-2 py-1 bg-white/5 border border-white/10">{s}</span>
                      ))}
                      {(inv.stages || []).slice(0,2).map((s) => (
                        <span key={s} className="text-xs rounded-full px-2 py-1 bg-white/5 border border-white/10">{s}</span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      {inv?.links?.linkedin && <a className="btn-ghost" href={inv.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
                      {inv?.links?.twitter && <a className="btn-ghost" href={inv.links.twitter} target="_blank" rel="noreferrer">Twitter</a>}
                      {inv?.links?.website && <a className="btn-ghost" href={inv.links.website} target="_blank" rel="noreferrer">Website</a>}
                      {inv?.links?.email && <a className="btn-primary" href={`mailto:${inv.links.email}`}>Email</a>}
                    </div>
                  </div>
                ))}
              </div>

              {!isLoading && investors.length === 0 && !error && (
                <div className="text-white/60 text-sm">Click Generate to see a curated list.</div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Slide Viewer Modal */}
      {showSlideViewer && (
        <div className="fixed inset-0 z-50">
          <SlideViewer 
            slides={pitchSlides.map(slide => ({
              ...slide,
              startupName: profile.startupName || 'Startup',
              description: slide.subtitle,
              bullets: slide.bullets || [],
              metrics: slide.metrics || {}
            }))} 
          />
          <button
            onClick={() => setShowSlideViewer(false)}
            className="absolute top-8 right-8 z-10 w-12 h-12 bg-white rounded-full border-2 border-purple-500 flex items-center justify-center hover:bg-purple-50 transition-colors"
          >
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </AppShell>
  )
}

function Field({ label, value, full = false }) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <div className="label mb-1">{label}</div>
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">{value}</div>
    </div>
  )
}


