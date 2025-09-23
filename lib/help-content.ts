interface HelpContent {
    title: string
    category: string
    readTime: string
    lastUpdated: string
    content: {
      introduction: string
      sections: {
        title: string
        content: string
        steps?: string[]
        tips?: string[]
        code?: string
      }[]
    }
    relatedArticles: {
      title: string
      slug: string
    }[]
  }
  
  const helpContent: Record<string, HelpContent> = {
    "create-account": {
      title: "How to Create Your Account",
      category: "Getting Started",
      readTime: "3 min read",
      lastUpdated: "May 2025",
      content: {
        introduction:
          "Welcome to Second Brain! Creating your account is the first step to unlocking AI-powered learning. This guide will walk you through the simple process of setting up your account.",
        sections: [
          {
            title: "Sign Up Process",
            content:
              "Getting started with Second Brain is quick and easy. You can create an account using your email address or sign up with Google for faster access.",
            steps: [
              'Visit the Second Brain homepage and click "Start Your Journey"',
              "Choose to sign up with email or Google account",
              "If using email, enter your full name, email address, and create a secure password",
              "Select your academic level (High School, University, Graduate, etc.)",
              "Choose your primary field of study from the dropdown menu",
              'Click "Plant Your Learning Seed" to create your account',
              "Check your email for a verification link and click it to activate your account",
            ],
            tips: [
              "Use a strong password with at least 8 characters, including numbers and symbols",
              "Choose an email you check regularly for important updates",
              "Your academic level helps us customize AI responses to your learning level",
            ],
          },
          {
            title: "Account Verification",
            content: "After signing up, you'll need to verify your email address to access all features of Second Brain.",
            steps: [
              "Check your email inbox for a message from Second Brain",
              'Click the "Verify Email" button in the email',
              "You'll be redirected to a confirmation page",
              "Your account is now fully activated and ready to use",
            ],
            tips: [
              "Check your spam folder if you don't see the verification email",
              "The verification link expires after 24 hours",
              "You can request a new verification email from the thank you page",
            ],
          },
          {
            title: "First Login",
            content: "Once your account is verified, you can log in and start exploring Second Brain's features.",
            steps: [
              "Go to the sign-in page",
              "Enter your email and password",
              'Click "Enter the Forest" to access your dashboard',
              "Complete the optional onboarding tour to learn about key features",
            ],
          },
        ],
      },
      relatedArticles: [
        { title: "Uploading Your First Document", slug: "upload-document" },
        { title: "Setting Up Your Subjects", slug: "setup-subjects" },
        { title: "Understanding AI Summaries", slug: "ai-summaries" },
      ],
    },
  
    "upload-document": {
      title: "Uploading Your First Document",
      category: "Getting Started",
      readTime: "4 min read",
      lastUpdated: "May 2025",
      content: {
        introduction:
          "Learn how to upload and process your study materials with Second Brain's AI-powered document analysis. Our system supports multiple file formats and automatically generates summaries, flashcards, and study materials.",
        sections: [
          {
            title: "Supported File Types",
            content:
              "Second Brain accepts a wide variety of file formats to accommodate different types of study materials.",
            steps: [
              "PDF files - Textbooks, research papers, lecture slides",
              "Image files - PNG, JPG, JPEG for handwritten notes or diagrams",
              "Audio files - MP3, WAV for recorded lectures or voice notes",
              "Text files - TXT, DOCX for written notes and documents",
            ],
            tips: [
              "PDF files work best for text-heavy content like textbooks",
              "High-quality images produce better OCR results for handwritten notes",
              "Audio files are transcribed automatically using AI speech recognition",
            ],
          },
          {
            title: "Upload Process",
            content: "Uploading documents is straightforward and includes automatic AI processing.",
            steps: [
              "Navigate to the Upload page from your dashboard",
              'Click "Choose Files" or drag and drop files into the upload area',
              "Select or create a subject category for organization",
              "Add a descriptive title for your document",
              'Click "Upload & Process" to start AI analysis',
              "Wait for processing to complete (usually 30-60 seconds)",
              "Review the generated summary and materials",
            ],
            tips: [
              "Organize documents by subject for better study planning",
              "Use descriptive titles to easily find documents later",
              "Processing time depends on file size and complexity",
            ],
          },
          {
            title: "AI Processing Features",
            content: "Once uploaded, our AI automatically analyzes your documents and creates study materials.",
            steps: [
              "Text extraction and OCR for images",
              "Automatic summarization of key concepts",
              "Generation of study flashcards",
              "Identification of important topics and themes",
              "Creation of potential quiz questions",
            ],
          },
          {
            title: "Managing Uploaded Documents",
            content: "After upload, you can view, edit, and organize your documents in the Materials section.",
            steps: [
              "Access all documents from the Materials page",
              "Use search and filters to find specific content",
              "Edit document titles and subjects as needed",
              "Download original files or generated summaries",
              "Delete documents you no longer need",
            ],
          },
        ],
      },
      relatedArticles: [
        { title: "Understanding AI Summaries", slug: "ai-summaries" },
        { title: "Setting Up Your Subjects", slug: "setup-subjects" },
        { title: "Generating Flashcards Automatically", slug: "generate-flashcards" },
      ],
    },
  
    "ai-summaries": {
      title: "Understanding AI Summaries",
      category: "Getting Started",
      readTime: "5 min read",
      lastUpdated: "May 2025",
      content: {
        introduction:
          "AI summaries are one of Second Brain's most powerful features. Learn how our advanced AI analyzes your documents and creates concise, study-friendly summaries that highlight the most important information.",
        sections: [
          {
            title: "How AI Summarization Works",
            content: "Our AI uses advanced natural language processing to understand and condense your study materials.",
            steps: [
              "Document analysis - AI reads and understands the full content",
              "Key concept identification - Important topics and themes are extracted",
              "Information hierarchy - Content is organized by importance",
              "Summary generation - Concise summaries are created with key points",
              "Quality review - AI ensures accuracy and completeness",
            ],
            tips: [
              "Longer documents typically produce more detailed summaries",
              "Technical content may include specialized terminology explanations",
              "AI adapts summary style based on your academic level",
            ],
          },
          {
            title: "Types of Summaries",
            content: "Second Brain generates different types of summaries based on your content and needs.",
            steps: [
              "Quick Overview - Brief 2-3 sentence summary of main points",
              "Detailed Summary - Comprehensive breakdown of all key concepts",
              "Key Terms - Important vocabulary and definitions",
              "Main Topics - Organized list of primary subjects covered",
              "Study Points - Specific items to focus on for exams",
            ],
          },
          {
            title: "Using Summaries Effectively",
            content: "Maximize your learning by using AI summaries as part of your study routine.",
            steps: [
              "Read the quick overview first to understand the main topic",
              "Review detailed summaries before diving into full documents",
              "Use key terms for vocabulary building and flashcard creation",
              "Focus on study points when preparing for exams",
              "Compare summaries across related documents for comprehensive understanding",
            ],
            tips: [
              "Summaries are starting points - always review original content for full understanding",
              "Use summaries to quickly refresh knowledge before classes",
              "Combine multiple document summaries for comprehensive topic coverage",
            ],
          },
          {
            title: "Customizing Summary Output",
            content: "You can influence how AI creates summaries based on your preferences and study goals.",
            steps: [
              "Specify focus areas when uploading documents",
              "Adjust academic level in settings for appropriate complexity",
              "Request specific summary types through the AI chat",
              "Provide feedback to improve future summaries",
              "Use custom prompts for specialized summary formats",
            ],
          },
        ],
      },
      relatedArticles: [
        { title: "Uploading Your First Document", slug: "upload-document" },
        { title: "Using the AI Tutor Chat", slug: "ai-tutor-chat" },
        { title: "Generating Flashcards Automatically", slug: "generate-flashcards" },
      ],
    },
  
    "setup-subjects": {
      title: "Setting Up Your Subjects",
      category: "Getting Started",
      readTime: "3 min read",
      lastUpdated: "May 2025",
      content: {
        introduction:
          "Organizing your study materials by subject is crucial for effective learning. Learn how to create and manage subjects in Second Brain to keep your materials organized and easily accessible.",
        sections: [
          {
            title: "Creating New Subjects",
            content: "Set up subject categories to organize your documents and study materials effectively.",
            steps: [
              "Go to the Upload page or Materials section",
              'Click "Create New Subject" or the "+" button',
              'Enter a descriptive subject name (e.g., "Biology 101", "World History")',
              "Choose a color theme for easy visual identification",
              "Add an optional description to clarify the subject scope",
              'Click "Create Subject" to save',
            ],
            tips: [
              'Use specific names like "Organic Chemistry" instead of just "Chemistry"',
              "Choose distinct colors for each subject for quick visual recognition",
              "Include course codes or semester information in subject names",
            ],
          },
          {
            title: "Managing Existing Subjects",
            content: "Keep your subjects organized and up-to-date as your studies progress.",
            steps: [
              "Access subject management from the Materials page",
              "Edit subject names, colors, or descriptions as needed",
              "Merge similar subjects to reduce clutter",
              "Archive completed courses to keep active subjects visible",
              "Delete subjects that are no longer needed",
            ],
          },
          {
            title: "Subject-Based Organization",
            content: "Use subjects to organize all your study materials and track progress effectively.",
            steps: [
              "Assign documents to appropriate subjects during upload",
              "Create flashcard sets organized by subject",
              "Generate subject-specific study plans",
              "Track progress and performance by subject",
              "Use subject filters to focus on specific areas",
            ],
            tips: [
              "Consistent subject organization improves AI recommendations",
              "Use subjects to create focused study sessions",
              "Review subject-specific analytics to identify weak areas",
            ],
          },
          {
            title: "Best Practices",
            content: "Follow these guidelines for optimal subject organization.",
            steps: [
              "Create subjects before uploading documents for better organization",
              "Use a consistent naming convention across all subjects",
              "Limit the number of active subjects to avoid overwhelm",
              "Regularly review and clean up unused subjects",
              "Use descriptive names that will make sense months later",
            ],
          },
        ],
      },
      relatedArticles: [
        { title: "Uploading Your First Document", slug: "upload-document" },
        { title: "Organizing Your Materials", slug: "organize-materials" },
        { title: "Creating Study Plans with AI", slug: "ai-study-plans" },
      ],
    },
  
    "ai-summarization": {
      title: "How AI Summarization Works",
      category: "AI Features",
      readTime: "6 min read",
      lastUpdated: "May 2025",
      content: {
        introduction:
          "Dive deep into the technology behind Second Brain's AI summarization. Understand how advanced machine learning models process your documents and create intelligent, context-aware summaries.",
        sections: [
          {
            title: "The AI Technology Stack",
            content: "Second Brain uses state-of-the-art language models and natural language processing techniques.",
            steps: [
              "Large Language Models (LLMs) for text understanding",
              "Optical Character Recognition (OCR) for image processing",
              "Speech-to-text conversion for audio files",
              "Named Entity Recognition for key term identification",
              "Semantic analysis for context understanding",
            ],
            tips: [
              "Our AI is specifically trained on educational content",
              "Models are regularly updated with the latest research",
              "Processing adapts to different academic disciplines",
            ],
          },
          {
            title: "Document Processing Pipeline",
            content: "Learn about the step-by-step process that transforms your documents into intelligent summaries.",
            steps: [
              "File upload and format detection",
              "Content extraction (text, images, audio)",
              "Preprocessing and cleaning of extracted content",
              "Semantic analysis and topic modeling",
              "Key concept identification and ranking",
              "Summary generation with context preservation",
              "Quality assurance and formatting",
            ],
          },
          {
            title: "Intelligent Content Analysis",
            content: "Our AI doesn't just extract text - it understands meaning, context, and educational value.",
            steps: [
              "Topic identification and categorization",
              "Concept relationship mapping",
              "Importance scoring for different sections",
              "Academic level assessment",
              "Learning objective alignment",
            ],
            tips: [
              "AI considers your academic level when creating summaries",
              "Context from previous documents improves accuracy",
              "Subject-specific terminology is properly handled",
            ],
          },
          {
            title: "Customization and Adaptation",
            content: "The AI learns from your preferences and adapts to your learning style over time.",
            steps: [
              "User feedback integration for continuous improvement",
              "Learning style adaptation based on usage patterns",
              "Subject-specific optimization",
              "Academic level calibration",
              "Personal preference learning",
            ],
          },
        ],
      },
      relatedArticles: [
        { title: "Understanding AI Summaries", slug: "ai-summaries" },
        { title: "Using the AI Tutor Chat", slug: "ai-tutor-chat" },
        { title: "Generating Flashcards Automatically", slug: "generate-flashcards" },
      ],
    },
  
    "generate-flashcards": {
      title: "Generating Flashcards Automatically",
      category: "AI Features",
      readTime: "4 min read",
      lastUpdated: "May 2025",
      content: {
        introduction:
          "Transform your study materials into effective flashcards with AI. Learn how Second Brain automatically creates high-quality flashcards from your documents and how to customize them for optimal learning.",
        sections: [
          {
            title: "Automatic Flashcard Generation",
            content: "Our AI analyzes your documents and creates targeted flashcards for key concepts and information.",
            steps: [
              "Upload your document to Second Brain",
              "AI identifies key concepts, definitions, and important facts",
              "Flashcards are automatically generated with questions and answers",
              "Cards are organized by topic and difficulty level",
              "Review and edit generated flashcards as needed",
            ],
            tips: [
              "AI creates different types of cards: definitions, concepts, and application questions",
              "Flashcards are tailored to your academic level",
              "More detailed documents produce more comprehensive flashcard sets",
            ],
          },
          {
            title: "Types of Flashcards Created",
            content: "Second Brain generates various flashcard types to support different learning objectives.",
            steps: [
              "Definition cards - Key terms and their meanings",
              "Concept cards - Important ideas and principles",
              "Fact cards - Specific information and data points",
              "Application cards - How to use or apply concepts",
              "Comparison cards - Differences between related topics",
            ],
          },
          {
            title: "Manual Flashcard Creation",
            content: "Create custom flashcards manually for specific topics or to supplement AI-generated cards.",
            steps: [
              'Go to the Flashcards page and click "Create Manual Set"',
              "Choose a subject and enter a set name",
              "Add individual cards with front and back content",
              "Set difficulty levels (Easy, Medium, Hard)",
              "Organize cards into logical groups or topics",
              "Save your custom flashcard set",
            ],
            tips: [
              "Combine AI-generated and manual cards for comprehensive coverage",
              "Use images and formatting to make cards more engaging",
              "Create cards for areas where you need extra practice",
            ],
          },
          {
            title: "Studying with Flashcards",
            content: "Use Second Brain's spaced repetition system to maximize your flashcard learning.",
            steps: [
              "Select a flashcard set to study",
              "Review cards and rate your confidence (Again, Hard, Good, Easy)",
              "AI schedules cards based on spaced repetition principles",
              "Focus on difficult cards that need more practice",
              "Track your progress and mastery over time",
            ],
            tips: [
              "Study regularly for best results with spaced repetition",
              "Be honest with your confidence ratings",
              "Review statistics to identify areas needing more attention",
            ],
          },
        ],
      },
      relatedArticles: [
        { title: "Using Spaced Repetition", slug: "spaced-repetition" },
        { title: "Understanding AI Summaries", slug: "ai-summaries" },
        { title: "Organizing Your Materials", slug: "organize-materials" },
      ],
    },
  
    "ai-tutor-chat": {
      title: "Using the AI Tutor Chat",
      category: "AI Features",
      readTime: "5 min read",
      lastUpdated: "May 2025",
      content: {
        introduction:
          "Get personalized help with your studies using Second Brain's AI tutor. Learn how to ask effective questions, get explanations, and use the chat feature to enhance your understanding of complex topics.",
        sections: [
          {
            title: "Getting Started with AI Tutor",
            content:
              "The AI tutor is your personal study assistant, available 24/7 to help with questions and explanations.",
            steps: [
              "Access the AI tutor from your dashboard or any study page",
              "Start with a clear question about your study material",
              "The AI will provide detailed explanations based on your uploaded content",
              "Ask follow-up questions to deepen your understanding",
              "Save important conversations for later reference",
            ],
            tips: [
              "Be specific in your questions for better answers",
              "Reference specific documents or topics when asking questions",
              "The AI has access to all your uploaded materials for context",
            ],
          },
          {
            title: "Types of Questions You Can Ask",
            content: "The AI tutor can help with a wide variety of academic questions and learning needs.",
            steps: [
              'Concept explanations - "Explain photosynthesis in simple terms"',
              'Problem solving - "How do I solve this type of math problem?"',
              'Comparisons - "What\'s the difference between mitosis and meiosis?"',
              'Applications - "How is this concept used in real life?"',
              'Study strategies - "How should I approach studying this topic?"',
            ],
          },
          {
            title: "Advanced Chat Features",
            content: "Make the most of the AI tutor with these advanced features and techniques.",
            steps: [
              'Reference specific documents: "Based on my biology notes, explain..."',
              'Request different explanation styles: "Explain this like I\'m 10 years old"',
              'Ask for examples: "Give me three examples of this concept"',
              'Request study plans: "Create a study schedule for this topic"',
              'Get quiz questions: "Test my knowledge on this subject"',
            ],
            tips: [
              "The AI remembers context within each conversation",
              "You can ask for clarification or more detail at any time",
              "Use the chat to prepare for exams and assignments",
            ],
          },
          {
            title: "Best Practices for AI Tutoring",
            content: "Get the most effective help from your AI tutor with these proven strategies.",
            steps: [
              "Start with specific questions rather than broad topics",
              "Provide context about your current understanding level",
              "Ask for step-by-step explanations for complex problems",
              "Request multiple examples to reinforce learning",
              "Use the tutor to check your understanding of concepts",
            ],
          },
        ],
      },
      relatedArticles: [
        { title: "Understanding AI Summaries", slug: "ai-summaries" },
        { title: "Creating Study Plans with AI", slug: "ai-study-plans" },
        { title: "Taking AI-Generated Quizzes", slug: "ai-quizzes" },
      ],
    },
  
    "ai-study-plans": {
      title: "Creating Study Plans with AI",
      category: "AI Features",
      readTime: "5 min read",
      lastUpdated: "May 2025",
      content: {
        introduction:
          "Let AI create personalized study plans based on your materials, goals, and schedule. Learn how to generate effective study schedules that adapt to your learning pace and exam dates.",
        sections: [
          {
            title: "AI Study Plan Generation",
            content: "Our AI analyzes your materials and creates customized study schedules tailored to your needs.",
            steps: [
              "Go to the Study Planner page from your dashboard",
              "Select the subjects and materials you want to include",
              "Set your target exam or deadline date",
              "Specify your available study time per day",
              "Choose your preferred study methods (flashcards, reading, practice tests)",
              'Click "Generate AI Study Plan" to create your schedule',
            ],
            tips: [
              "Be realistic about your available study time",
              "Include buffer time for unexpected events",
              "AI considers the difficulty and length of your materials",
            ],
          },
          {
            title: "Customizing Your Study Plan",
            content: "Adjust and personalize your AI-generated study plan to fit your specific needs and preferences.",
            steps: [
              "Review the generated schedule and timeline",
              "Adjust study session lengths and frequencies",
              "Modify topic priorities based on your confidence levels",
              "Add or remove specific materials from the plan",
              "Set reminders and notifications for study sessions",
            ],
          },
          {
            title: "Study Plan Features",
            content: "Your AI study plan includes comprehensive features to support effective learning.",
            steps: [
              "Daily study schedules with specific topics and materials",
              "Progress tracking and completion indicators",
              "Spaced repetition scheduling for flashcards",
              "Review sessions before important dates",
              "Adaptive scheduling based on your performance",
            ],
            tips: [
              "Plans automatically adjust based on your progress",
              "Regular review sessions help reinforce learning",
              "The AI balances new content with review material",
            ],
          },
          {
            title: "Following Your Study Plan",
            content: "Make the most of your AI-generated study plan with consistent execution and tracking.",
            steps: [
              "Check your daily study schedule each morning",
              "Complete study sessions and mark them as done",
              "Use the recommended materials and methods",
              "Track your progress and confidence levels",
              "Adjust the plan if you fall behind or get ahead",
            ],
            tips: [
              "Consistency is more important than perfection",
              "Take breaks and don't overload yourself",
              "Celebrate completing study milestones",
            ],
          },
        ],
      },
      relatedArticles: [
        { title: "Organizing Your Materials", slug: "organize-materials" },
        { title: "Tracking Your Progress", slug: "track-progress" },
        { title: "Using Spaced Repetition", slug: "spaced-repetition" },
      ],
    },
  
    "organize-materials": {
      title: "Organizing Your Materials",
      category: "Study Tools",
      readTime: "4 min read",
      lastUpdated: "May 2025",
      content: {
        introduction:
          "Keep your study materials organized and easily accessible with Second Brain's powerful organization tools. Learn best practices for structuring your content for maximum efficiency.",
        sections: [
          {
            title: "Material Organization System",
            content: "Second Brain provides multiple ways to organize and categorize your study materials.",
            steps: [
              "Subject-based organization - Group materials by course or topic",
              "Document types - Separate lectures, textbooks, notes, and assignments",
              "Date-based sorting - Organize by upload date or relevance",
              "Custom tags - Add descriptive labels for easy searching",
              "Favorites system - Mark important materials for quick access",
            ],
            tips: [
              "Use consistent naming conventions for easy identification",
              "Create a logical folder structure that matches your courses",
              "Regular organization prevents clutter and confusion",
            ],
          },
          {
            title: "Search and Filter Tools",
            content: "Quickly find specific materials using Second Brain's advanced search and filtering capabilities.",
            steps: [
              "Use the search bar to find materials by title, content, or tags",
              "Filter by subject, document type, or upload date",
              "Sort results by relevance, date, or alphabetical order",
              "Save frequently used search queries for quick access",
              "Use advanced search operators for precise results",
            ],
          },
          {
            title: "Tagging and Categorization",
            content: "Enhance organization with custom tags and categories that make sense for your study style.",
            steps: [
              "Add descriptive tags when uploading documents",
              "Use consistent tag naming across similar materials",
              "Create tag categories (e.g., difficulty level, topic, importance)",
              "Edit and update tags as your understanding evolves",
              "Use tags to create custom study collections",
            ],
            tips: [
              "Start with broad tags and add specific ones as needed",
              "Use tags to indicate study priority or difficulty",
              "Review and clean up unused tags periodically",
            ],
          },
          {
            title: "Best Organization Practices",
            content: "Follow these proven strategies to maintain an organized and efficient study library.",
            steps: [
              "Organize materials immediately after uploading",
              "Use descriptive titles that will make sense later",
              "Create a consistent folder and naming structure",
              "Regularly review and clean up outdated materials",
              "Back up important materials and organization structure",
            ],
          },
        ],
      },
      relatedArticles: [
        { title: "Setting Up Your Subjects", slug: "setup-subjects" },
        { title: "Uploading Your First Document", slug: "upload-document" },
        { title: "Tracking Your Progress", slug: "track-progress" },
      ],
    },
  
    "spaced-repetition": {
      title: "Using Spaced Repetition",
      category: "Study Tools",
      readTime: "6 min read",
      lastUpdated: "May 2025",
      content: {
        introduction:
          "Master the science of spaced repetition to dramatically improve your long-term retention. Learn how Second Brain's intelligent scheduling system helps you review material at optimal intervals.",
        sections: [
          {
            title: "What is Spaced Repetition?",
            content:
              "Spaced repetition is a learning technique that involves reviewing information at increasing intervals to improve long-term retention.",
            steps: [
              "Initial learning - First exposure to new information",
              "First review - Shortly after initial learning (1-2 days)",
              "Second review - After a longer interval (1 week)",
              "Subsequent reviews - At exponentially increasing intervals",
              "Mastery - Information moves to long-term memory",
            ],
            tips: [
              'The technique is based on the "forgetting curve" research',
              "Optimal intervals depend on how well you know the material",
              "Consistent practice is key to effectiveness",
            ],
          },
          {
            title: "How Second Brain Implements Spaced Repetition",
            content: "Our AI-powered system automatically schedules your flashcard reviews for optimal learning.",
            steps: [
              "AI analyzes your performance on each flashcard",
              "Cards you struggle with appear more frequently",
              "Well-known cards are scheduled for longer intervals",
              "The system adapts to your individual learning pace",
              "Progress tracking shows your improvement over time",
            ],
          },
          {
            title: "Using the Spaced Repetition System",
            content: "Get the most out of spaced repetition with proper technique and consistent practice.",
            steps: [
              "Study your scheduled flashcards daily",
              "Rate your confidence honestly (Again, Hard, Good, Easy)",
              "Don't skip difficult cards - they need more practice",
              "Review the explanation if you get a card wrong",
              "Maintain consistent daily study sessions",
            ],
            tips: [
              "Quality of attention matters more than study time",
              "Be honest with your confidence ratings",
              "Short, frequent sessions are more effective than long cramming",
            ],
          },
          {
            title: "Optimizing Your Spaced Repetition Practice",
            content: "Advanced strategies to maximize the effectiveness of your spaced repetition study sessions.",
            steps: [
              "Study at the same time each day for consistency",
              "Focus on understanding, not just memorization",
              "Create connections between related concepts",
              "Use active recall before checking the answer",
              "Review your progress statistics regularly",
            ],
            tips: [
              "The system works best with daily practice",
              "Don't worry if you miss a day - just continue the next day",
              "Focus on your weakest areas for maximum improvement",
            ],
          },
        ],
      },
      relatedArticles: [
        { title: "Generating Flashcards Automatically", slug: "generate-flashcards" },
        { title: "Tracking Your Progress", slug: "track-progress" },
        { title: "Creating Study Plans with AI", slug: "ai-study-plans" },
      ],
    },
  
    "ai-quizzes": {
      title: "Taking AI-Generated Quizzes",
      category: "Study Tools",
      readTime: "4 min read",
      lastUpdated: "May 2025",
      content: {
        introduction:
          "Test your knowledge and identify learning gaps with AI-generated quizzes. Learn how to create, take, and analyze quizzes based on your study materials for effective self-assessment.",
        sections: [
          {
            title: "Creating AI Quizzes",
            content: "Generate custom quizzes from your uploaded materials to test your understanding.",
            steps: [
              "Go to the Quiz page from your dashboard",
              "Select the materials you want to be quizzed on",
              "Choose the number of questions (5, 10, 15, or 20)",
              "Select question types (multiple choice, true/false, short answer)",
              "Set the difficulty level based on your confidence",
              'Click "Generate Quiz" to create your test',
            ],
            tips: [
              "Mix different question types for comprehensive testing",
              "Start with easier quizzes and gradually increase difficulty",
              "Focus on recent materials for better retention",
            ],
          },
          {
            title: "Taking Quizzes Effectively",
            content: "Maximize the learning value of your quiz sessions with proper technique.",
            steps: [
              "Read each question carefully before answering",
              "Don't rush - take time to think through your responses",
              "Use the process of elimination for multiple choice questions",
              "Make educated guesses rather than leaving questions blank",
              "Review explanations for both correct and incorrect answers",
            ],
          },
          {
            title: "Understanding Quiz Results",
            content: "Analyze your quiz performance to identify strengths and areas for improvement.",
            steps: [
              "Review your overall score and percentage correct",
              "Identify topics where you scored poorly",
              "Read explanations for questions you missed",
              "Note patterns in your incorrect answers",
              "Create study plans to address weak areas",
            ],
            tips: [
              "Focus on understanding why answers are correct, not just memorizing",
              "Use incorrect answers as learning opportunities",
              "Retake quizzes on difficult topics after additional study",
            ],
          },
          {
            title: "Quiz Analytics and Progress Tracking",
            content: "Use quiz data to track your learning progress and optimize your study strategy.",
            steps: [
              "View your quiz history and score trends over time",
              "Identify subjects where you consistently struggle",
              "Track improvement in specific topic areas",
              "Compare performance across different materials",
              "Use analytics to adjust your study focus",
            ],
          },
        ],
      },
      relatedArticles: [
        { title: "Tracking Your Progress", slug: "track-progress" },
        { title: "Understanding AI Summaries", slug: "ai-summaries" },
        { title: "Creating Study Plans with AI", slug: "ai-study-plans" },
      ],
    },
  
    "track-progress": {
      title: "Tracking Your Progress",
      category: "Study Tools",
      readTime: "4 min read",
      lastUpdated: "May 2025",
      content: {
        introduction:
          "Monitor your learning journey with Second Brain's comprehensive progress tracking tools. Learn how to use analytics and insights to optimize your study strategy and achieve your academic goals.",
        sections: [
          {
            title: "Progress Dashboard Overview",
            content:
              "Your dashboard provides a comprehensive view of your learning progress across all subjects and activities.",
            steps: [
              "Study streak - Days of consecutive study activity",
              "Materials processed - Number of documents uploaded and analyzed",
              "Flashcards mastered - Cards you've successfully learned",
              "Quiz performance - Average scores and improvement trends",
              "Time spent studying - Daily and weekly study time tracking",
            ],
            tips: [
              "Check your dashboard daily for motivation",
              "Set goals for study streaks and material completion",
              "Use progress data to identify your most productive study times",
            ],
          },
          {
            title: "Subject-Specific Analytics",
            content: "Dive deep into your performance in individual subjects to identify strengths and weaknesses.",
            steps: [
              "View progress by subject from the Materials page",
              "See completion rates for each subject's materials",
              "Track flashcard mastery levels per subject",
              "Monitor quiz scores and improvement trends",
              "Identify subjects that need more attention",
            ],
          },
          {
            title: "Learning Insights and Recommendations",
            content: "Second Brain provides AI-powered insights to help you optimize your study approach.",
            steps: [
              "Personalized study recommendations based on your performance",
              "Identification of optimal study times and patterns",
              "Suggestions for materials that need review",
              "Recommendations for study method improvements",
              "Alerts for subjects falling behind schedule",
            ],
            tips: [
              "Act on AI recommendations to improve efficiency",
              "Regular review of insights helps maintain good study habits",
              "Use recommendations to adjust your study plan",
            ],
          },
          {
            title: "Setting and Achieving Goals",
            content: "Use progress tracking to set realistic goals and monitor your achievement.",
            steps: [
              "Set daily, weekly, and monthly study goals",
              "Track completion of study plans and milestones",
              "Monitor progress toward exam preparation deadlines",
              "Celebrate achievements and learning milestones",
              "Adjust goals based on your actual performance",
            ],
          },
        ],
      },
      relatedArticles: [
        { title: "Creating Study Plans with AI", slug: "ai-study-plans" },
        { title: "Taking AI-Generated Quizzes", slug: "ai-quizzes" },
        { title: "Using Spaced Repetition", slug: "spaced-repetition" },
      ],
    },
  
    "upgrade-pro": {
      title: "Upgrading to Pro",
      category: "Account & Billing",
      readTime: "3 min read",
      lastUpdated: "May 2025",
      content: {
        introduction:
          "Unlock the full potential of Second Brain with a Pro subscription. Learn about Pro features, pricing, and how to upgrade your account for unlimited AI-powered learning.",
        sections: [
          {
            title: "Pro Features and Benefits",
            content: "Second Brain Pro provides unlimited access to all features and advanced AI capabilities.",
            steps: [
              "Unlimited document uploads and processing",
              "Advanced AI summaries with detailed analysis",
              "Unlimited flashcard generation and study sets",
              "Priority AI processing for faster results",
              "Advanced analytics and progress tracking",
              "Collaboration features for study groups",
              "Priority customer support",
            ],
            tips: [
              "Pro features are designed for serious students and professionals",
              "Unlimited uploads allow you to digitize your entire study library",
              "Advanced AI provides more detailed and nuanced summaries",
            ],
          },
          {
            title: "Upgrading Your Account",
            content: "The upgrade process is simple and secure, with immediate access to Pro features.",
            steps: [
              "Go to Settings from your dashboard",
              'Click on the "Subscription" tab',
              "Choose between monthly or annual billing",
              "Enter your payment information securely",
              "Confirm your upgrade and billing details",
              "Enjoy immediate access to all Pro features",
            ],
          },
          {
            title: "Pricing and Billing Options",
            content: "Choose the billing option that works best for your budget and study timeline.",
            steps: [
              "Monthly subscription - $9.99/month with flexibility to cancel anytime",
              "Annual subscription - $99.99/year (save 17% compared to monthly)",
              "Student discounts available with valid .edu email address",
              "All plans include a 7-day free trial",
              "Cancel anytime with no long-term commitments",
            ],
            tips: [
              "Annual billing provides the best value for long-term users",
              "Student discounts make Pro more affordable for academic use",
              "Free trial lets you test all Pro features risk-free",
            ],
          },
          {
            title: "Making the Most of Pro",
            content: "Maximize your Pro subscription value with these advanced features and strategies.",
            steps: [
              "Upload your entire study library for comprehensive AI analysis",
              "Use advanced study plans for complex subjects",
              "Collaborate with classmates on shared materials",
              "Take advantage of priority processing during busy periods",
              "Use detailed analytics to optimize your study approach",
            ],
          },
        ],
      },
      relatedArticles: [
        { title: "Managing Your Subscription", slug: "manage-subscription" },
        { title: "Understanding Usage Limits", slug: "usage-limits" },
        { title: "Creating Study Plans with AI", slug: "ai-study-plans" },
      ],
    },
  
    "manage-subscription": {
      title: "Managing Your Subscription",
      category: "Account & Billing",
      readTime: "3 min read",
      lastUpdated: "May 2025",
      content: {
        introduction:
          "Learn how to manage your Second Brain subscription, including billing, plan changes, and account settings. Keep your subscription up-to-date and optimized for your needs.",
        sections: [
          {
            title: "Accessing Subscription Settings",
            content: "Find and manage all your subscription details from your account settings.",
            steps: [
              "Log in to your Second Brain account",
              "Go to Settings from your dashboard",
              'Click on the "Subscription" tab',
              "View your current plan, billing cycle, and next payment date",
              "Access options to modify or cancel your subscription",
            ],
          },
          {
            title: "Changing Your Plan",
            content: "Upgrade, downgrade, or modify your subscription plan as your needs change.",
            steps: [
              'From the Subscription settings, click "Change Plan"',
              "Choose between Free, Monthly Pro, or Annual Pro",
              "Review the changes and new billing amount",
              "Confirm the plan change",
              "Changes take effect immediately for upgrades, at the next billing cycle for downgrades",
            ],
            tips: [
              "Upgrades are prorated - you only pay the difference",
              "Downgrades take effect at the end of your current billing period",
              "You keep Pro features until your current period ends",
            ],
          },
          {
            title: "Billing and Payment Management",
            content: "Update payment methods, view billing history, and manage invoices.",
            steps: [
              "Update credit card information in the Payment Methods section",
              "View billing history and download invoices",
              "Set up automatic billing notifications",
              "Update billing address and tax information",
              "Contact support for billing questions or disputes",
            ],
          },
          {
            title: "Subscription Troubleshooting",
            content: "Resolve common subscription and billing issues quickly.",
            steps: [
              "Payment failed - Update your payment method and retry",
              "Can't access Pro features - Check your subscription status",
              "Billing questions - Review your billing history",
              "Want to pause subscription - Contact support for options",
              "Technical issues - Use the help center or contact support",
            ],
          },
        ],
      },
      relatedArticles: [
        { title: "Upgrading to Pro", slug: "upgrade-pro" },
        { title: "Understanding Usage Limits", slug: "usage-limits" },
        { title: "Canceling Your Account", slug: "cancel-account" },
      ],
    },
  
    "usage-limits": {
      title: "Understanding Usage Limits",
      category: "Account & Billing",
      readTime: "4 min read",
      lastUpdated: "May 2025",
      content: {
        introduction:
          "Learn about Second Brain's usage limits for free and Pro accounts. Understand how limits work, how to track your usage, and when to consider upgrading.",
        sections: [
          {
            title: "Free Plan Limits",
            content: "The free plan provides generous limits to help you get started with Second Brain.",
            steps: [
              "5 document uploads per month",
              "10 AI-generated flashcards per document",
              "Basic AI summaries (up to 500 words)",
              "3 AI tutor conversations per day",
              "5 AI-generated quizzes per month",
              "Standard processing speed",
            ],
            tips: [
              "Limits reset at the beginning of each month",
              "Use your uploads strategically for your most important materials",
              "Free plan is perfect for trying out Second Brain's features",
            ],
          },
          {
            title: "Pro Plan Benefits",
            content: "Pro subscribers enjoy unlimited access to all Second Brain features.",
            steps: [
              "Unlimited document uploads and processing",
              "Unlimited flashcard generation",
              "Advanced AI summaries (no word limit)",
              "Unlimited AI tutor conversations",
              "Unlimited quiz generation",
              "Priority processing speed",
              "Advanced analytics and insights",
            ],
          },
          {
            title: "Tracking Your Usage",
            content: "Monitor your current usage and plan accordingly to avoid hitting limits.",
            steps: [
              "Check usage statistics on your dashboard",
              "View remaining uploads and AI credits",
              "See usage history and patterns",
              "Get notifications when approaching limits",
              "Plan your uploads based on remaining quota",
            ],
            tips: [
              "Usage resets on the first day of each month",
              "Pro users can see detailed usage analytics",
              "Plan important uploads early in the month",
            ],
          },
          {
            title: "What Happens When You Hit Limits",
            content: "Understand what occurs when you reach your plan's usage limits.",
            steps: [
              "Document uploads are temporarily disabled until next month",
              "Existing materials and features remain fully accessible",
              "You can still study with flashcards and take quizzes",
              "AI tutor conversations may be limited on free plans",
              "Upgrade to Pro for immediate unlimited access",
            ],
          },
        ],
      },
      relatedArticles: [
        { title: "Upgrading to Pro", slug: "upgrade-pro" },
        { title: "Managing Your Subscription", slug: "manage-subscription" },
        { title: "Uploading Your First Document", slug: "upload-document" },
      ],
    },
  
    "cancel-account": {
      title: "Canceling Your Account",
      category: "Account & Billing",
      readTime: "3 min read",
      lastUpdated: "May 2025",
      content: {
        introduction:
          "Learn how to cancel your Second Brain subscription or delete your account. Understand the process, what happens to your data, and how to export your materials before canceling.",
        sections: [
          {
            title: "Canceling Your Subscription",
            content: "Cancel your Pro subscription while keeping your account and data intact.",
            steps: [
              "Go to Settings and click on the Subscription tab",
              'Click "Cancel Subscription" at the bottom of the page',
              "Choose your reason for canceling (optional feedback)",
              "Confirm the cancellation",
              "You'll continue to have Pro access until the end of your billing period",
              "Your account automatically converts to the free plan afterward",
            ],
            tips: [
              "You can reactivate your subscription anytime",
              "No data is lost when canceling subscription",
              "Consider downgrading instead of canceling if you still want basic features",
            ],
          },
          {
            title: "Exporting Your Data",
            content: "Download your materials and data before canceling if you want to keep them.",
            steps: [
              'Go to Settings and click on the "Data Export" tab',
              "Select the materials you want to export",
              "Choose export format (PDF, text, or original files)",
              'Click "Generate Export" and wait for processing',
              "Download the export file to your device",
              "Verify all important data is included",
            ],
          },
          {
            title: "Deleting Your Account",
            content: "Permanently delete your Second Brain account and all associated data.",
            steps: [
              "Export any data you want to keep first",
              'Go to Settings and click on "Account"',
              'Scroll down to "Delete Account" section',
              "Read the warning about permanent data deletion",
              'Type "DELETE" to confirm you understand',
              'Click "Permanently Delete Account"',
            ],
            tips: [
              "Account deletion is permanent and cannot be undone",
              "All your materials, flashcards, and progress will be lost",
              "Consider canceling subscription instead if you might return",
            ],
          },
          {
            title: "What Happens After Cancellation",
            content: "Understand what occurs after you cancel your subscription or delete your account.",
            steps: [
              "Subscription cancellation - Account converts to free plan with limited features",
              "Account deletion - All data is permanently removed within 30 days",
              "Billing stops immediately for both cancellation types",
              "You can create a new account anytime if you deleted your account",
              "Previous subscription history is not recoverable after account deletion",
            ],
          },
        ],
      },
      relatedArticles: [
        { title: "Managing Your Subscription", slug: "manage-subscription" },
        { title: "Understanding Usage Limits", slug: "usage-limits" },
        { title: "Upgrading to Pro", slug: "upgrade-pro" },
      ],
    },
  }
  
  export function getHelpContent(slug: string): HelpContent | null {
    return helpContent[slug] || null
  }
  
  export function getAllHelpSlugs(): string[] {
    return Object.keys(helpContent)
  }
  
