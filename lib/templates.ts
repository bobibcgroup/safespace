export interface CampaignTemplate {
  id: string
  name: string
  category: string
  title: string
  question: string
  description: string
}

export const campaignTemplates: CampaignTemplate[] = [
  {
    id: 'employee-satisfaction',
    name: 'Employee Satisfaction',
    category: 'HR',
    title: 'Employee Satisfaction Survey',
    question: 'How satisfied are you with your current role and work environment?',
    description: 'Gather feedback on employee satisfaction and workplace experience',
  },
  {
    id: 'product-feedback',
    name: 'Product Feedback',
    category: 'Product',
    title: 'Product Feedback',
    question: 'What are your thoughts on our product? What features would you like to see?',
    description: 'Collect user feedback and feature requests',
  },
  {
    id: 'team-retrospective',
    name: 'Team Retrospective',
    category: 'Team',
    title: 'Sprint Retrospective',
    question: 'What went well this sprint? What could be improved?',
    description: 'Team retrospective for continuous improvement',
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    category: 'Support',
    title: 'Customer Support Experience',
    question: 'How was your experience with our customer support team?',
    description: 'Gather feedback on customer support interactions',
  },
  {
    id: 'onboarding',
    name: 'Onboarding Experience',
    category: 'HR',
    title: 'Onboarding Feedback',
    question: 'How was your onboarding experience? What could we improve?',
    description: 'Collect feedback on the onboarding process',
  },
  {
    id: 'meeting-feedback',
    name: 'Meeting Feedback',
    category: 'Team',
    title: 'Meeting Effectiveness',
    question: 'How effective was this meeting? What could make it better?',
    description: 'Gather feedback on meeting quality and effectiveness',
  },
  {
    id: 'workplace-culture',
    name: 'Workplace Culture',
    category: 'HR',
    title: 'Workplace Culture Survey',
    question: 'How would you describe our workplace culture? What values matter most to you?',
    description: 'Understand workplace culture and values',
  },
  {
    id: 'remote-work',
    name: 'Remote Work Experience',
    category: 'HR',
    title: 'Remote Work Experience',
    question: 'How is your remote work experience? What challenges or benefits have you noticed?',
    description: 'Collect feedback on remote work arrangements',
  },
]

export function getTemplatesByCategory(category?: string): CampaignTemplate[] {
  if (!category) return campaignTemplates
  return campaignTemplates.filter(t => t.category === category)
}

export function getTemplateById(id: string): CampaignTemplate | undefined {
  return campaignTemplates.find(t => t.id === id)
}

