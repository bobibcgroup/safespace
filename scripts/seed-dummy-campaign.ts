import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding dummy campaign with responses...')

  // Get or create a test user
  let user = await prisma.user.findFirst({
    where: { email: 'test@example.com' },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Test Admin',
        email: 'test@example.com',
        password: '$2a$10$dummy', // Dummy password hash
        role: 'admin',
      },
    })
    console.log('✅ Created test user')
  }

  // Create a dummy campaign
  const campaign = await prisma.campaign.create({
    data: {
      title: 'Q1 2024 Team Satisfaction Survey',
      question: 'What are the top 3 things we should improve to make your work experience better?',
      userId: user.id,
      isActive: true,
      slug: 'q1-2024-team-satisfaction-survey',
    },
  })

  console.log(`✅ Created campaign: ${campaign.title}`)

  // Create diverse dummy responses
  const responses = [
    {
      text: 'I think we need better communication between teams. Sometimes I don\'t know what other departments are working on, which makes collaboration difficult. Also, the meeting schedule is too packed - we spend more time in meetings than actually getting work done. Lastly, I\'d love to see more opportunities for professional development and training.',
      sentiment: 'neutral' as const,
      mood: '😐',
    },
    {
      text: 'The work-life balance has been really challenging lately. I\'m working late hours almost every day and it\'s starting to affect my personal life. Management needs to understand that we can\'t keep up this pace forever. Also, the tools we use are outdated and slow down our productivity significantly.',
      sentiment: 'negative' as const,
      mood: '🙁',
    },
    {
      text: 'I love the team culture here! Everyone is supportive and collaborative. The recent changes to our project management process have been great. My only suggestion would be to have more team building activities - they really help build stronger relationships.',
      sentiment: 'positive' as const,
      mood: '😀',
    },
    {
      text: 'The onboarding process for new team members needs improvement. It took me months to understand all the systems and processes. Also, I feel like there\'s not enough feedback on my work - I\'d appreciate more regular check-ins with my manager.',
      sentiment: 'neutral' as const,
      mood: '😐',
    },
    {
      text: 'We need to address the technical debt in our codebase. It\'s becoming harder to add new features because of all the legacy code. Also, the deployment process is too manual and error-prone. I think we should invest more in automation and infrastructure improvements.',
      sentiment: 'negative' as const,
      mood: '🙁',
    },
    {
      text: 'The flexible work arrangements have been amazing! Being able to work from home has improved my productivity and work-life balance. The company culture is really inclusive and I feel valued. Keep up the great work!',
      sentiment: 'positive' as const,
      mood: '😀',
    },
    {
      text: 'I think we need clearer career progression paths. It\'s hard to know what steps to take to advance in my role. Also, the performance review process feels arbitrary - I\'d like more transparency on how decisions are made. Lastly, the office space could use some improvements - better lighting and more quiet areas for focused work.',
      sentiment: 'neutral' as const,
      mood: '😐',
    },
    {
      text: 'The workload distribution is uneven. Some team members are overwhelmed while others seem to have less to do. This creates tension and resentment. Also, we need better documentation - I spend too much time trying to figure out how things work instead of actually working.',
      sentiment: 'negative' as const,
      mood: '😞',
    },
    {
      text: 'I really appreciate the transparency from leadership about company goals and challenges. The recent all-hands meeting was informative. The mentorship program has been helpful too. My suggestion would be to expand it to include more junior team members.',
      sentiment: 'positive' as const,
      mood: '🙂',
    },
    {
      text: 'The feedback loop is too slow. When I report issues or suggest improvements, it takes weeks or months to see any action. This makes me feel like my input doesn\'t matter. Also, we need better tools for remote collaboration - the current setup is clunky.',
      sentiment: 'negative' as const,
      mood: '🙁',
    },
    {
      text: 'I love the diversity and inclusion initiatives. It makes me feel like I belong here. The company benefits are competitive and the health insurance is great. I\'d suggest having more social events to help team members connect better.',
      sentiment: 'positive' as const,
      mood: '😀',
    },
    {
      text: 'The project deadlines are unrealistic. We\'re constantly rushing to meet deadlines which leads to lower quality work. Management needs to be more realistic about timelines. Also, I\'d like to see more recognition for individual contributions - it feels like only team achievements are celebrated.',
      sentiment: 'negative' as const,
      mood: '🙁',
    },
    {
      text: 'The code review process is excellent - I learn a lot from the feedback. The tech stack is modern and enjoyable to work with. My only concern is that we could use more automated testing to catch bugs earlier.',
      sentiment: 'positive' as const,
      mood: '🙂',
    },
    {
      text: 'We need better conflict resolution processes. When disagreements arise, they tend to fester instead of being addressed directly. Also, the decision-making process is unclear - sometimes decisions are made without consulting the people who will be affected.',
      sentiment: 'neutral' as const,
      mood: '😐',
    },
    {
      text: 'The remote work policy is perfect. I feel trusted to manage my own time and I\'m more productive. The company culture of continuous learning is great - I\'ve grown a lot professionally. Keep doing what you\'re doing!',
      sentiment: 'positive' as const,
      mood: '😀',
    },
    {
      text: 'The salary is below market rate for my role and experience level. This makes it hard to stay motivated, especially when I see similar roles paying more elsewhere. Also, the bonus structure is unclear - I don\'t know what I need to do to earn a bonus.',
      sentiment: 'negative' as const,
      mood: '😞',
    },
    {
      text: 'I appreciate the focus on mental health and wellness. The employee assistance program is helpful. The flexible hours allow me to attend therapy appointments. However, I think we could do more to reduce stress and prevent burnout.',
      sentiment: 'neutral' as const,
      mood: '😐',
    },
    {
      text: 'The innovation days where we can work on passion projects are fantastic! It shows the company values creativity. The hackathons are fun and productive. I\'d love to see more opportunities like this.',
      sentiment: 'positive' as const,
      mood: '😀',
    },
    {
      text: 'The bureaucracy is frustrating. Simple requests take forever to get approved. There are too many layers of management. I wish we had more autonomy to make decisions at our level.',
      sentiment: 'negative' as const,
      mood: '🙁',
    },
    {
      text: 'The team is really talented and I learn something new every day. The code quality standards are high which makes the codebase maintainable. I\'d suggest having more cross-team knowledge sharing sessions.',
      sentiment: 'positive' as const,
      mood: '🙂',
    },
  ]

  // Create responses with varied timestamps (spread over a few days)
  for (let i = 0; i < responses.length; i++) {
    const response = responses[i]
    const daysAgo = Math.floor(i / 5) // Spread responses over a few days
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - daysAgo)
    createdAt.setHours(10 + (i % 8), (i * 7) % 60) // Vary the time

    await prisma.response.create({
      data: {
        campaignId: campaign.id,
        text: response.text,
        sentiment: response.sentiment,
        mood: response.mood,
        status: i % 4 === 0 ? 'needs_attention' : i % 4 === 1 ? 'new' : i % 4 === 2 ? 'in_review' : 'resolved',
        createdAt,
      },
    })
  }

  console.log(`✅ Created ${responses.length} responses`)
  console.log(`\n📊 Campaign ID: ${campaign.id}`)
  console.log(`🔗 Campaign Slug: ${campaign.slug}`)
  console.log(`\n✨ Dummy campaign seeded successfully!`)
  console.log(`\n💡 Next steps:`)
  console.log(`   1. Visit the campaign in the dashboard`)
  console.log(`   2. Go to the Report page`)
  console.log(`   3. Click "Generate AI Report"`)
  console.log(`   4. Review the generated report`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

