const REPORTS = [
  {
    key: "business",
    label: "Business Analysis",
    icon: "🌿",
    desc: "Brand positioning, value propositions & market fit",
    outputFile: "business_output.txt",
    prompt: `
Perform a comprehensive Business Analysis.

Include:
• Company overview
• Unique Value Proposition (UVP)
• Products & Services
• Business Model
• Brand Positioning
• Target Market
• Strengths
• Weaknesses
• Opportunities
• Threats (SWOT)
• Growth recommendations
`
  },

  {
    key: "audience",
    label: "Audience Research",
    icon: "🦋",
    desc: "Target personas, demographics & behavioural signals",
    outputFile: "audience_output.txt",
    prompt: `
Identify the target audience.

Include:
• Primary audience
• Secondary audience
• Demographics
• Interests
• Pain points
• Buying behaviour
• Customer personas
• Marketing recommendations
`
  },

  {
    key: "keyword",
    label: "Keyword Research",
    icon: "✨",
    desc: "High-value terms, long-tail opportunities & search intent",
    outputFile: "keyword_output.txt",
    prompt: `
Perform keyword research.

Include:
• Primary keywords
• Secondary keywords
• Long-tail keywords
• Search intent
• Content opportunities
• Keyword clusters
`
  },

  {
    key: "competitor",
    label: "Competitor Discovery",
    icon: "🌙",
    desc: "Rival landscape, gaps & differentiation angles",
    outputFile: "competitor_output.txt",
    prompt: `
Identify major competitors.

Include:
• Direct competitors
• Indirect competitors
• Competitor strengths
• Competitor weaknesses
• Market gaps
• Differentiation opportunities
`
  },

  {
    key: "backlink",
    label: "Backlink Opportunities",
    icon: "🕸️",
    desc: "Link-building prospects & authority sources",
    outputFile: "backlink_output.txt",
    prompt: `
Find backlink opportunities.

Include:
• High-authority websites
• Guest posting opportunities
• Resource pages
• Business directories
• Broken-link opportunities
• Partnership opportunities
`
  },

  {
    key: "seo",
    label: "SEO Analysis",
    icon: "🔮",
    desc: "On-page issues, technical health & quick wins",
    outputFile: "seo_output.txt",
    prompt: `
Perform a complete SEO audit.

Include:
• Technical SEO
• Metadata
• Heading structure
• Internal linking
• Content quality
• Keyword optimisation
• Recommendations
`
  },

  {
    key: "ad",
    label: "Ad Creative Variants",
    icon: "🌸",
    desc: "Headline hooks, copy angles & creative directions",
    outputFile: "ad_output.txt",
    prompt: `
Generate ad creatives.

Include:
• Google Search ads
• Facebook ads
• Instagram ads
• LinkedIn ads
• Headlines
• Primary text
• CTAs
• Creative ideas
`
  }
];