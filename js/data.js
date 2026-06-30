// TechnoStore360 static mock database with premium tech visual references

const categories = [
  {
    id: "software-solutions",
    title: "Software Solutions",
    description: "Enterprise software, CRM, databases, and core productivity applications.",
    icon: "layers",
    count: 12
  },

  {
    id: "hardware-products",
    title: "Hardware Products",
    description: "Servers, networking gear, firewalls, B2B workspaces, and client machines.",
    icon: "monitor",
    count: 15
  },
  {
    id: "cloud-security",
    title: "Cloud & Security",
    description: "Infrastructure as a Service, web security firewalls, and network protection.",
    icon: "shield-check",
    count: 18
  },
  {
    id: "ai-tools",
    title: "AI Tools",
    description: "Generative AI, machine learning APIs, and business intelligence assistants.",
    icon: "brain",
    count: 14
  },
  {
    id: "business-automation",
    title: "Business Automation",
    description: "ERP systems, workflow automations, billing, and accounting.",
    icon: "cpu",
    count: 10
  },
  {
    id: "it-services",
    title: "On-demand IT Services",
    description: "Dedicated remote tech support, migration services, and network setup.",
    icon: "wrench",
    count: 7
  },
  {
    id: "resources",
    title: "Resources & Support",
    description: "Whitepapers, compliance manuals, developer templates, and expert guides.",
    icon: "book-open",
    count: 9
  }
];

const products = [

  {
    id: "zoho-crm",
    name: "Zoho CRM Plus",
    category: "Software Solutions",
    categoryId: "software-solutions",
    brand: "Zoho",
    shortDesc: "Unified customer experience platform to manage sales, marketing, support, and analytics.",
    longDesc: "Zoho CRM Plus helps businesses sell smarter, faster, and better. With omnichannel support, sales pipelines automation, predictive intelligence, and unified reporting, Zoho CRM connects your sales, marketing, and support teams to provide customers with an exceptional journey.",
    rating: 4.6,
    reviewsCount: 890,
    price: 57.00,
    originalPrice: 71.25,
    priceText: "$57.00 / user / mo",
    dealHighlight: "Partner Deal: 20% Off",
    verified: true,
    demoAvailable: true,
    deployment: "Cloud / SaaS",
    businessType: "SMB & Mid-Market",
    support: "24/5 Email, Chat & Phone",
    bestUseCase: "Omnichannel customer relationship tracking and pipeline automation.",
    imageUrl: "assets/zoho_crm.png",
    variants: ["#6366f1", "#f59e0b"],
    features: [
      "AI-powered sales assistant (Zia) for forecasts",
      "Omnichannel communication (Email, Phone, Social, Portal)",
      "Blueprint designer for sales processes mapping",
      "Unified analytics and conversion dashboards",
      "Lead scoring and marketing automation flows"
    ],
    pros: [
      "Excellent value for feature list compared to Salesforce",
      "Zia AI offers genuine insights and next-best actions",
      "Deep customization of pipelines and forms"
    ],
    cons: [
      "UI can occasionally feel cluttered and sluggish",
      "Third-party integrations require custom scripts sometimes",
      "Free version is extremely limited for B2B needs"
    ],
    plans: [
      { name: "Standard", price: "$14.00", period: "user/month", features: ["Sales pipelines", "Custom dashboards", "Email templates"] },
      { name: "Professional", price: "$23.00", period: "user/month", features: ["Macros & Triggers", "Inventory management", "Web-to-lead forms"] },
      { name: "Enterprise", price: "$40.00", period: "user/month", features: ["Zia AI Assistant", "Multi-page layouts", "Canvas builder"] }
    ],
    faqs: [
      { q: "How long does it take to deploy Zoho CRM?", a: "Basic setup can be ready in 1 to 2 days. Highly customized pipelines and ERP syncs typically take 2 to 4 weeks." },
      { q: "Does Zoho offer migration from Salesforce?", a: "Yes, a built-in migration wizard (Zwitch) helps import Salesforce data tables automatically." }
    ]
  },

  {
    id: "quickbooks",
    name: "QuickBooks Online Advanced",
    category: "Business Automation",
    categoryId: "business-automation",
    brand: "Intuit",
    shortDesc: "Cloud accounting software for automated invoicing, cash flow management, expenses tracking, and tax filing.",
    longDesc: "QuickBooks Online Advanced is built for growing businesses looking for smarter tools and deeper insights. It features automated workflows, custom user roles, batch transactions processing, dashboard custom widgets, and a dedicated account manager to streamline financial operations.",
    rating: 4.5,
    reviewsCount: 650,
    price: 200.00,
    originalPrice: 250.00,
    priceText: "$200.00 / mo",
    dealHighlight: "Save 20% on Annual",
    verified: true,
    demoAvailable: true,
    deployment: "Cloud / SaaS",
    businessType: "SMB & Growing Business",
    support: "24/7 Phone Support",
    bestUseCase: "B2B financial tracking, ledger audit trail, tax readiness, and payroll automation.",
    imageUrl: "assets/quickbooks.png",
    variants: ["#10b981", "#8b5cf6", "#cbd5e1"],
    features: [
      "Automated custom workflows (reminders, routing)",
      "Batch invoicing and expenses creation",
      "Custom user permissions and control profiles",
      "Advanced Fathom reporting and business metrics",
      "Direct banking integrations for automated bookkeeping"
    ],
    pros: [
      "Easiest bookkeeping system for tax compliance",
      "Automated bank feeds reduce hours of manual logging",
      "Excellent app integrations network (Shopify, Stripe, etc.)"
    ],
    cons: [
      "Advanced tier is relatively expensive",
      "Learning curve for complex corporate setups",
      "Inventory module is basic; requires add-ons for manufacturing"
    ],
    plans: [
      { name: "Simple Start", price: "$30.00", period: "month", features: ["Income/expense tracking", "Invoicing", "Tax estimates"] },
      { name: "Plus", price: "$90.00", period: "month", features: ["Inventory", "Project tracking", "Manage bills", "5 Users max"] },
      { name: "Advanced", price: "$200.00", period: "month", features: ["Unlimited users", "Batch processing", "Custom roles", "Premium support"] }
    ],
    faqs: [
      { q: "Can my accountant access my QuickBooks data?", a: "Yes, you can invite up to two accountants to access your books for free on any plan." }
    ]
  },
  {
    id: "cisco-firewall",
    name: "Cisco Secure Firewall FPR 1010",
    category: "Cloud & Security",
    categoryId: "cloud-security",
    brand: "Cisco",
    shortDesc: "Enterprise-grade Next-Generation Firewall (NGFW) providing threat defense, URL filtering, and application control.",
    longDesc: "The Cisco Secure Firewall Firepower 1000 Series is a family of four threat-focused Next-Generation Firewall platforms that deliver business resiliency, threat defense, and robust management capabilities. Ideal for small to midsize offices needing robust threat protection.",
    rating: 4.7,
    reviewsCount: 420,
    price: 990.00,
    priceText: "From $990.00 (Get Quote)",
    verified: true,
    demoAvailable: true,
    deployment: "On-Premise / Hardware",
    businessType: "Mid-Market & Enterprise",
    support: "Dedicated Cisco TAC (24/7)",
    bestUseCase: "Securing physical office networks and handling remote VPN tunnels.",
    imageUrl: "assets/cisco_firewall.png",
    variants: ["#3b82f6", "#475569"],
    features: [
      "Next-Gen Intrusion Prevention System (NGIPS)",
      "Advanced Malware Protection (AMP) integration",
      "Granular Application visibility and control (AVC)",
      "High-speed SSL/TLS decryption and threat inspection",
      "Unified security management console"
    ],
    pros: [
      "Top-tier physical hardware reliability and throughput",
      "Exceptional packet inspection capabilities",
      "Deep integration with Cisco Secure portfolio"
    ],
    cons: [
      "High initial capital hardware expenditure",
      "Requires certified network engineers (CCNA/CCNP) to configure",
      "Licensing updates (Cisco Smart Licensing) can be tedious"
    ],
    plans: [
      { name: "Hardware Unit (FPR-1010)", price: "$990.00", period: "one-time", features: ["Base firewall appliance", "8x RJ45 ports", "Standard routing"] },
      { name: "Threat & Malware Subscription", price: "$450.00", period: "year", features: ["IPS updates", "AMP feeds", "URL Filtering database"] },
      { name: "Enterprise Support (TAC)", price: "$280.00", period: "year", features: ["24/7 phone access", "Next-business-day hardware swap"] }
    ],
    faqs: [
      { q: "Can I manage this firewall from the cloud?", a: "Yes, you can manage it using Cisco Defense Orchestrator (CDO) or via the local Firepower Device Manager." }
    ]
  },
  {
    id: "aws-cloud",
    name: "AWS Cloud Infrastructure Suite",
    category: "Cloud & Security",
    categoryId: "cloud-security",
    brand: "Amazon Web Services",
    shortDesc: "Scalable cloud computing, database engines, serverless deployment, and microservices hosting.",
    longDesc: "Amazon Web Services (AWS) is the world's most comprehensive and broadly adopted cloud platform, offering over 200 fully featured services from data centers globally. Run your applications on EC2 virtual machines, host file buckets on S3, deploy managed databases on RDS, and scale dynamically.",
    rating: 4.9,
    reviewsCount: 2100,
    price: 0,
    priceText: "Pay-as-you-go / Get Quote",
    verified: true,
    demoAvailable: false,
    deployment: "Cloud / SaaS",
    businessType: "Developer, SMB & Enterprise",
    support: "AWS Enterprise Support Plan Available",
    bestUseCase: "Scaling web applications, hosting databases, and running big data analytics.",
    imageUrl: "assets/aws_cloud.png",
    variants: ["#f97316", "#3b82f6", "#cbd5e1"],
    features: [
      "Elastic Compute Cloud (EC2) instances on demand",
      "Simple Storage Service (S3) secure file repositories",
      "Relational Database Service (RDS) support for Postgres/MySQL",
      "AWS IAM for granular identity access management",
      "Auto-scaling networks with VPC controls"
    ],
    pros: [
      "Practically unlimited capacity and massive global presence",
      "Highly sophisticated security certifications and compliance",
      "Pay only for the exact computing resources you consume"
    ],
    cons: [
      "Extremely complex pricing calculators; risk of runaway billing",
      "Vast catalog of options can lead to decision paralysis",
      "Premium technical support plans require a percentage surcharge"
    ],
    plans: [
      { name: "AWS Free Tier", price: "$0.00", period: "12 months", features: ["750 hours EC2 monthly", "5 GB S3 storage", "Light RDS database"] },
      { name: "Developer Support", price: "$29.00", period: "month or 3%", features: ["Email support", "12-hour response time SLA", "Architecture guidance"] },
      { name: "Business Support", price: "$100.00", period: "month or 10%", features: ["24/7 phone/chat support", "1-hour critical response", "Well-Architected reviews"] }
    ],
    faqs: [
      { q: "What is pay-as-you-go pricing?", a: "You pay only for the virtual resources (CPU, RAM, storage, network traffic) you launch, billed by the second or hour." }
    ]
  },
  {
    id: "chatgpt-business",
    name: "ChatGPT Business Enterprise",
    category: "AI Tools",
    categoryId: "ai-tools",
    brand: "OpenAI",
    shortDesc: "Enterprise-grade generative AI assistant with admin controls, zero data retention for training, and high-speed API.",
    longDesc: "ChatGPT Enterprise offers enterprise-grade security and privacy, unlimited high-speed GPT-4 access, longer context windows for processing large documents, advanced data analysis capabilities, customization options, and dedicated admin consoles for user provisioning.",
    rating: 4.9,
    reviewsCount: 950,
    price: 60.00,
    priceText: "$60.00 / user / mo",
    verified: true,
    demoAvailable: true,
    deployment: "Cloud / SaaS",
    businessType: "SMB & Enterprise",
    support: "Dedicated Customer Success & API support",
    bestUseCase: "Content generation, coding assistance, automated text extraction, and customer support chatbot scripting.",
    imageUrl: "assets/chatgpt_business.png",
    variants: ["#10b981", "#0f172a", "#cbd5e1"],
    features: [
      "Unlimited high-speed GPT-4, GPT-4o, and reasoning models",
      "Enterprise security: SOC2 certification, data encrypted at rest and in transit",
      "Your company data is NEVER used to train OpenAI models",
      "Admin console with single sign-on (SSO) and domain verification",
      "Shared chat templates and workspace builders"
    ],
    pros: [
      "Outstanding NLP reasoning and coding capabilities",
      "Strict data privacy guards ensure company data security",
      "Advanced custom models capability (GPTs)"
    ],
    cons: [
      "Output requires human verification; occasional AI hallucinations",
      "Minimum user count requirements (often 150+ seats for Enterprise)",
      "Requires organizational policies to monitor appropriate usage"
    ],
    plans: [
      { name: "ChatGPT Team", price: "$25.00", period: "user/month", features: ["Admin console", "25+ member teams", "Shared GPTs", "No training on data"] },
      { name: "ChatGPT Enterprise", price: "Custom", period: "user/month", features: ["Unlimited usage", "SSO/SAML support", "Dedicated account manager", "Advanced analytics"] }
    ],
    faqs: [
      { q: "Will ChatGPT train on my corporate documents?", a: "No. Under the ChatGPT Team and Enterprise plans, all data, prompts, and files remain completely private and are excluded from training." }
    ]
  },
  {
    id: "sophos-security",
    name: "Sophos Intercept X Endpoint",
    category: "Cloud & Security",
    categoryId: "cloud-security",
    brand: "Sophos",
    shortDesc: "Next-gen endpoint protection for B2B workstations with anti-ransomware, deep learning malware detection, and EDR.",
    longDesc: "Sophos Intercept X is the world's best endpoint protection, combining signatureless exploit prevention, deep learning malware detection, and dedicated anti-ransomware capabilities (CryptoGuard) with Endpoint Detection and Response (EDR) in a unified cloud agent.",
    rating: 4.8,
    reviewsCount: 310,
    price: 4.50,
    originalPrice: 5.60,
    priceText: "$4.50 / user / mo",
    dealHighlight: "First 10 Seats Free",
    verified: true,
    demoAvailable: true,
    deployment: "Hybrid (Cloud Console / Local Agent)",
    businessType: "SMB & Enterprise",
    support: "24/7 Sophos Threat Advisory Team",
    bestUseCase: "Protecting employees' laptops and company servers from ransomware attacks.",
    imageUrl: "assets/sophos_security.png",
    variants: ["#3b82f6", "#ef4444", "#10b981"],
    features: [
      "Deep Learning malware detection scanner engine",
      "CryptoGuard technology to rollback file changes",
      "Credential theft protection rules",
      "Endpoint Detection and Response (EDR) threat hunting capabilities",
      "Central web control and application blocklists"
    ],
    pros: [
      "Outstanding protection record against zero-day ransomware",
      "Automatic file rollback saves critical local data immediately",
      "Central cloud control portal makes fleet management very easy"
    ],
    cons: [
      "Endpoint agent can consume system CPU during background full disk scans",
      "EDR search syntax requires a security-trained IT staff to run effectively",
      "Uninstalling the agent requires a complex admin tamper-protection bypass key"
    ],
    plans: [
      { name: "Intercept X Essentials", price: "$2.80", period: "user/month", features: ["Deep learning threat scanner", "Anti-ransomware", "Sophos Central management"] },
      { name: "Intercept X Advanced", price: "$4.50", period: "user/month", features: ["Essentials features", "EDR threat hunting", "Exploit protection", "Root cause analysis"] },
      { name: "Intercept X Advanced with XDR", price: "$7.20", period: "user/month", features: ["Advanced features", "Cross-product detection (Firewall + Email)", "SQL threat queries"] }
    ],
    faqs: [
      { q: "What is Tamper Protection?", a: "Tamper protection prevents users (or malware simulating users) from disabling security defenses or uninstalling the Sophos agent without explicit admin approval via the cloud dashboard." }
    ]
  },
  {
    id: "microsoft-365",
    name: "Microsoft 365",
    category: "Software Solutions",
    categoryId: "software-solutions",
    brand: "Microsoft",
    shortDesc: "Enterprise productivity and collaboration suite.",
    longDesc: "Microsoft 365 brings together premium Office apps, intelligent cloud services, and advanced security to help you run your business securely and productively.",
    rating: 4.8,
    reviewsCount: 1240,
    price: 12.50,
    originalPrice: 15.60,
    priceText: "$12.50 / user / mo",
    dealHighlight: "Volume Savings",
    verified: true,
    demoAvailable: true,
    deployment: "Cloud / SaaS",
    businessType: "All Scales",
    support: "24/7 Phone & Email Support",
    bestUseCase: "Corporate email hosting, documents collaboration, and office utilities.",
    imageUrl: "assets/microsoft_365.png",
    variants: ["#00a4ef", "#ffb900", "#f25022", "#7fba00"],
    features: [
      "Outlook professional corporate email hosting",
      "Desktop Office apps (Word, Excel, PowerPoint)",
      "Secure OneDrive file repository cloud backup",
      "Microsoft Teams conferencing & channels"
    ],
    pros: ["Gold standard B2B email hosting", "1TB cloud storage per user", "Cross-platform document editor desktop apps"],
    cons: ["SaaS admin console is notoriously complex", "Requires modern clients for optimal local sync speed"],
    plans: [
      { name: "Business Basic", price: "$6.00", period: "user/month", features: ["Teams, Exchange, OneDrive", "Web apps only"] },
      { name: "Business Standard", price: "$12.50", period: "user/month", features: ["Basic features", "Desktop Office apps", "1TB OneDrive storage"] },
      { name: "Business Premium", price: "$22.00", period: "user/month", features: ["Standard features", "Advanced security settings", "Intune and Azure Information Protection"] }
    ],
    faqs: [
      { q: "Can we install desktop apps on multiple computers?", a: "Yes, you can install Office desktop apps on up to 5 PCs or Macs per user license." }
    ]
  },
  {
    id: "zoho-books",
    name: "Zoho Books",
    category: "Business Automation",
    categoryId: "business-automation",
    brand: "Zoho",
    shortDesc: "Smart accounting software for growing businesses to manage inventory, tax compliance, and billing.",
    longDesc: "Zoho Books is a comprehensive B2B accounting system that tracks finances, sends professional custom invoices, automates bank feeds, and generates audit-ready reports.",
    rating: 4.7,
    reviewsCount: 512,
    price: 15.00,
    originalPrice: 18.75,
    priceText: "$15.00 / month",
    dealHighlight: "Partner Discount",
    verified: true,
    demoAvailable: true,
    deployment: "Cloud / SaaS",
    businessType: "SMB & Growing Business",
    support: "24/5 Live Chat, Email & Phone Support",
    bestUseCase: "Ledger entry automation, automated billing, and GST/VAT compliance.",
    imageUrl: "assets/zoho.png",
    variants: ["#ff0000", "#00ff00", "#0000ff"],
    features: [
      "Automated corporate invoicing and payment receipts",
      "Live banking feed integrations and matching rules",
      "Purchase orders & custom vendor balance ledger",
      "Stock inventory valuation alerts"
    ],
    pros: ["Deeply integrated with Zoho One ecosystem", "Intuitive billing templates customization"],
    cons: ["Advanced features require higher subscription tiers", "Basic plan has user number restrictions"],
    plans: [
      { name: "Standard", price: "$15.00", period: "month", features: ["3 Users max", "Invoices & Expenses", "Reconciliation"] },
      { name: "Professional", price: "$40.00", period: "month", features: ["5 Users max", "Purchase Orders", "Multi-currency support"] },
      { name: "Premium", price: "$60.00", period: "month", features: ["10 Users max", "Custom reports scheduler", "Client portal branding"] }
    ],
    faqs: [
      { q: "Is Zoho Books compliant with GST in India?", a: "Yes. Zoho Books is a certified GST-compliant accounting software in India." }
    ]
  },
  {
    id: "google-workspace",
    name: "Google Workspace",
    category: "Software Solutions",
    categoryId: "software-solutions",
    brand: "Google",
    shortDesc: "Professional business email, secure video conferencing, shared calendar and Google Drive cloud storage.",
    longDesc: "Google Workspace offers a suite of collaboration tools for businesses including business Gmail, Google Meet, Google Drive storage, Google Docs, Sheets, and Slides.",
    rating: 4.8,
    reviewsCount: 1980,
    price: 6.00,
    originalPrice: 7.50,
    priceText: "$6.00 / user / mo",
    dealHighlight: "Volume Savings",
    verified: true,
    demoAvailable: true,
    deployment: "Cloud / SaaS",
    businessType: "All Scales",
    support: "24/7 Global Administrator Support Console",
    bestUseCase: "Flexible collaborative office documents editing, central file directories, and custom email domains.",
    imageUrl: "assets/google_workspace.png",
    variants: ["#4285f4", "#ea4335", "#fbbc05", "#34a853"],
    features: [
      "Custom business email domain addresses (@yourcompany.com)",
      "High-definition Google Meet video conferencing",
      "Shared collaborative Google Docs and Sheets spreadsheets",
      "Google Drive secure cloud space administration"
    ],
    pros: ["Best collaborative documents editor in the industry", "SSO and enterprise access control setup is easy", "Fast search indices inside files"],
    cons: ["SaaS price increases in recent years", "Offline file synchronization has occasionally lagged"],
    plans: [
      { name: "Business Starter", price: "$6.00", period: "user/month", features: ["Custom business email", "100 participant video Meet", "30 GB cloud storage per user"] },
      { name: "Business Standard", price: "$12.00", period: "user/month", features: ["150 participant Meet + recording", "2 TB cloud storage per user", "Shared drives management"] },
      { name: "Business Plus", price: "$18.00", period: "user/month", features: ["500 participant Meet + tracking", "5 TB cloud storage per user", "Vault and advanced endpoint management"] }
    ],
    faqs: [
      { q: "How much storage comes with Google Workspace?", a: "Starter plan provides 30GB per user. Standard offers 2TB per user, and Plus offers 5TB per user." }
    ]
  },
  {
    id: "microsoft-azure",
    name: "Microsoft Azure",
    category: "Cloud & Security",
    categoryId: "cloud-security",
    brand: "Microsoft",
    shortDesc: "Flexible pay-as-you-go cloud compute resources, hybrid server databases, Active Directory, and hosting services.",
    longDesc: "Microsoft Azure is a comprehensive cloud platform providing over 200 integrated services including virtual servers hosting, database engine management, secure corporate networks, and AI APIs.",
    rating: 4.8,
    reviewsCount: 940,
    price: 0,
    priceText: "Pay-as-you-go / Get Quote",
    dealHighlight: "Azure Promo: Save 20%",
    verified: true,
    demoAvailable: false,
    deployment: "Cloud / SaaS",
    businessType: "Developer & Enterprise scale",
    support: "Dedicated Azure ProDirect support engineers",
    bestUseCase: "Hybrid cloud servers replication, Active Directory user authentication, and AI machine learning hosting.",
    imageUrl: "assets/azure_logo.png",
    variants: ["#0089d6", "#5c2d91", "#cbd5e1"],
    features: [
      "Azure Virtual Machines on-demand deployment",
      "Azure SQL database managed hosting engine",
      "Entra ID (formerly Azure Active Directory) user sync",
      "Azure App Services scalable web deployments"
    ],
    pros: ["Superb hybrid Windows Server environments sync", "Top corporate security compliance certificates"],
    cons: ["Azure Pricing Calculator is very complex", "Technical support requires separate subscriptions"],
    plans: [
      { name: "Pay-As-You-Go", price: "$0.00", period: "monthly usage", features: ["No upfront cost", "Over 55 free services", "Only pay for active resources"] },
      { name: "Developer Support", price: "$29.00", period: "month", features: ["Non-critical technical support", "Email access to engineers"] },
      { name: "Standard Support", price: "$100.00", period: "month", features: ["24/7 support access", "Under 1 hour response time SLA"] }
    ],
    faqs: [
      { q: "Does Azure support Linux server instances?", a: "Yes. Over 60% of active Azure compute cores run Linux server OS images." }
    ]
  },

  // NEW BRAND-ALIGNED LIVE PRODUCTS FROM TECHNOSTORE360
  {
    id: "zegocloud-sdk",
    name: "ZEGOCLOUD Voice & Video SDK",
    category: "Software Solutions",
    categoryId: "software-solutions",
    brand: "ZEGOCLOUD",
    shortDesc: "Real-time communication cloud SDK for voice calling, high-definition video conferencing, and live streaming.",
    longDesc: "ZEGOCLOUD provides developer-friendly SDKs and APIs to integrate high-quality real-time voice, video, and chat functionalities into mobile, desktop, and web applications. Equipped with global network clustering and noise suppression, it ensures seamless interaction for businesses globally.",
    rating: 4.8,
    reviewsCount: 310,
    price: 149.00,
    originalPrice: 186.25,
    priceText: "$149.00 / month / developer license",
    dealHighlight: "Partner Deal: 20% Off",
    verified: true,
    demoAvailable: true,
    deployment: "Cloud / SaaS",
    businessType: "Developers & Digital Agencies",
    support: "24/7 Technical Ticket Support",
    bestUseCase: "Embedding video chat or virtual classrooms into existing business tools.",
    imageUrl: "assets/zegocloud.png",
    variants: ["#2563eb", "#3b82f6", "#cbd5e1"],
    features: [
      "Ultra-low latency real-time voice & video SDKs",
      "Built-in AI noise reduction and echo cancellation",
      "Dynamic network adaptive bandwidth adjustment",
      "Interactive whiteboards and screen sharing extensions"
    ],
    pros: ["Easiest video calling SDK to set up in web apps", "Consistent global connectivity with low jitter", "Flexible pay-per-minute runtime models available"],
    cons: ["Pricing increases rapidly for massive concurrent audiences", "Highly customized UI layouts require native framework knowledge"],
    plans: [
      { name: "Startup License", price: "$149.00", period: "month", features: ["Voice & Video calling APIs", "10,000 free monthly minutes", "Community support"] },
      { name: "Growth License", price: "$499.00", period: "month", features: ["High-speed video call SDK", "50,000 free monthly minutes", "Developer slack support channel"] }
    ],
    faqs: [
      { q: "Does ZEGOCLOUD support React Native?", a: "Yes. Native SDK packages and wrappers are available for React Native, Flutter, iOS, Android, and Web." }
    ]
  },
  {
    id: "trello-board",
    name: "Atlassian Trello",
    category: "Software Solutions",
    categoryId: "software-solutions",
    brand: "Trello",
    shortDesc: "Visual board and list manager to organize projects, assign tasks, and track team progress.",
    longDesc: "Trello is the premier visual project management tool that uses cards, lists, and boards to help teams organize and prioritize their tasks. Integrate custom automations (Butler) and power-ups to coordinate sprints, customer workflows, and company milestones.",
    rating: 4.6,
    reviewsCount: 1450,
    price: 5.00,
    originalPrice: 6.00,
    priceText: "$5.00 / user / mo",
    dealHighlight: "First 10 Seats Free",
    verified: true,
    demoAvailable: true,
    deployment: "Cloud / SaaS",
    businessType: "Small Teams & SMB",
    support: "24/5 Email Support",
    bestUseCase: "Visual Kanban workflows, marketing pipelines, and basic task management.",
    imageUrl: "assets/trello.png",
    variants: ["#0079bf", "#f59e0b"],
    features: [
      "Unlimited custom board creation and lists",
      "Butler workflow automation rules",
      "Rich card attachments, checklists, and dates",
      "Over 100 Power-up integrations (Slack, Jira, GitHub)"
    ],
    pros: ["Extremely intuitive user interface requiring zero learning curve", "Highly effective visual cards overview", "Generous free and starter tiers for small setups"],
    cons: ["Lacks advanced reporting or critical path gantt charts", "Card dependencies are basic compared to Jira"],
    plans: [
      { name: "Standard", price: "$5.00", period: "user/month", features: ["Unlimited boards", "Advanced checklists", "Custom fields"] },
      { name: "Premium", price: "$10.00", period: "user/month", features: ["Dashboard & Timeline views", "Unlimited Butler automations", "Workspace templates"] }
    ],
    faqs: [
      { q: "What is a Trello Power-Up?", a: "A Power-Up is an integration that links Trello to other apps or adds advanced features like calendars and custom buttons." }
    ]
  },
  {
    id: "monday-work-os",
    name: "monday.com Work OS",
    category: "Business Automation",
    categoryId: "business-automation",
    brand: "monday.com",
    shortDesc: "Customizable work operating system to manage projects, tasks, workflows, and resource allocation.",
    longDesc: "monday.com Work OS is an open platform where teams can build custom workflow applications in minutes. Shape your sales pipelines, marketing campaign boards, software development schedules, and project timelines with deep team communication and automated status rules.",
    rating: 4.7,
    reviewsCount: 1020,
    price: 9.00,
    originalPrice: 10.00,
    priceText: "$9.00 / user / mo",
    dealHighlight: "Save 10%",
    verified: true,
    demoAvailable: true,
    deployment: "Cloud / SaaS",
    businessType: "SMB & EnterprisesScale",
    support: "24/7 Email & Phone Support",
    bestUseCase: "Cross-departmental collaboration, central task coordination, and status automation.",
    imageUrl: "assets/monday.png",
    variants: ["#ff3d57", "#00cff4", "#cbd5e1"],
    features: [
      "Dynamic board builder with columns, timelines, and budgets",
      "Code-free automation builder for status updates and emails",
      "Multiple views: Kanban, Gantt, Calendar, and Form inputs",
      "Custom team workload panels and dashboard reporting"
    ],
    pros: ["Remarkably customizable dashboard boards", "Outstanding, colorful UI that drives employee adoption", "Powerful visual automation workflows"],
    cons: ["Minimum package of 3 user seats required", "Complex custom formulas require higher plans"],
    plans: [
      { name: "Basic", price: "$9.00", period: "user/month", features: ["Unlimited boards", "200+ templates", "iOS & Android apps"] },
      { name: "Standard", price: "$12.00", period: "user/month", features: ["Timeline & Gantt views", "250 automation actions", "Calendar view"] },
      { name: "Pro", price: "$20.00", period: "user/month", features: ["Private boards", "25,000 automation actions", "Formula columns"] }
    ],
    faqs: [
      { q: "Is there a minimum seat requirement?", a: "Yes. monday.com requires a minimum of 3 user seats for all paid plans." }
    ]
  },
  {
    id: "jira-software",
    name: "Jira Software",
    category: "Software Solutions",
    categoryId: "software-solutions",
    brand: "Atlassian",
    shortDesc: "Agile issue tracking and project management for software developers, product managers, and IT teams.",
    longDesc: "Jira Software is the leading software development tool used by agile teams to plan, track, and release world-class products. Support Scrum boards, Kanban boards, roadmaps, and agile reports, integrating directly with code repositories like GitHub, GitLab, and Bitbucket.",
    rating: 4.8,
    reviewsCount: 1850,
    price: 7.75,
    originalPrice: 9.00,
    priceText: "$7.75 / user / mo",
    dealHighlight: "Volume Savings",
    verified: true,
    demoAvailable: true,
    deployment: "Cloud / SaaS",
    businessType: "Agile Development Teams",
    support: "24/7 Support (Enterprise Tier)",
    bestUseCase: "Software bug tracking, sprint planning, and dev pipeline coordination.",
    imageUrl: "assets/atlassian.png",
    variants: ["#0052cc", "#cbd5e1"],
    features: [
      "Custom agile boards (Scrum, Kanban, Mixed sprints)",
      "Agile roadmaps & dependency path mapping",
      "Code repositories integrations (auto-track commits to ticket)",
      "Comprehensive agile reports (Burndown, Velocity, Control charts)"
    ],
    pros: ["Unmatched issue tracking detail and custom state transitions", "Robust integration with Bitbucket, GitHub, and Slack", "Massively scalable for hundreds of development squads"],
    cons: ["Highly complex configuration panel for administrators", "UI can feel heavy and dry for non-developers"],
    plans: [
      { name: "Standard", price: "$7.75", period: "user/month", features: ["Single project sheets", "250 GB storage limit", "Audit logs"] },
      { name: "Premium", price: "$15.25", period: "user/month", features: ["Advanced roadmaps", "Unlimited storage", "99.9% Uptime SLA", "24/7 support"] }
    ],
    faqs: [
      { q: "Does Jira offer a free tier?", a: "Yes. Jira is free for up to 10 users on a basic cloud setup." }
    ]
  },
  {
    id: "productboard",
    name: "Productboard Platform",
    category: "Business Automation",
    categoryId: "business-automation",
    brand: "Productboard",
    shortDesc: "Customer-centric product management system to gather feedback, prioritize features, and align roadmaps.",
    longDesc: "Productboard helps product managers understand what users need, prioritize what to build next, and rally everyone around a structured visual roadmap. Gather feedback from emails, support tickets, and sales calls in a central repository.",
    rating: 4.7,
    reviewsCount: 312,
    price: 25.00,
    originalPrice: 30.00,
    priceText: "$25.00 / editor / mo",
    dealHighlight: "Save 17%",
    verified: true,
    demoAvailable: true,
    deployment: "Cloud / SaaS",
    businessType: "Product Teams & SaaS Companies",
    support: "24/5 Live Chat Support",
    bestUseCase: "Feature prioritization matrix, customer feedback aggregation, and interactive roadmap sharing.",
    imageUrl: "assets/productboard.png",
    variants: ["#f76b1c", "#cbd5e1"],
    features: [
      "Feedback repository: Import from Zendesk, Intercom, and Slack",
      "Feature prioritization scoring matrix",
      "Public-facing or internal interactive roadmaps",
      "User validation portal & survey builder"
    ],
    pros: ["Centralizes scattered feedback into actionable user requests", "Excellent customizable roadmap presentations", "Prioritization matrices build data-backed consensus"],
    cons: ["Steep learning curve for large non-product organizations", "Relatively expensive for small startups"],
    plans: [
      { name: "Essentials", price: "$25.00", period: "editor/month", features: ["Feedback board", "Prioritization matrices", "Jira & Trello sync"] },
      { name: "Pro", price: "$60.00", period: "editor/month", features: ["Advanced roadmaps", "Feature voting portal", "Custom fields and statuses"] }
    ],
    faqs: [
      { q: "Do contributors pay for seat licenses?", a: "No. You only pay for Editors (Product managers, designers). Viewers and contributors who submit feedback are free." }
    ]
  },
  {
    id: "asana-work",
    name: "Asana Work Management",
    category: "Business Automation",
    categoryId: "business-automation",
    brand: "Asana",
    shortDesc: "Collaborative project planner and team goal tracker to manage complex project paths and dependencies.",
    longDesc: "Asana is the premier work management platform that helps teams orchestrate their work, from daily tasks to strategic initiatives. Connect work across projects, map task dependencies, and track team milestones in list, board, calendar, or timeline formats.",
    rating: 4.7,
    reviewsCount: 1140,
    price: 10.99,
    originalPrice: 13.49,
    priceText: "$10.99 / user / mo",
    dealHighlight: "Save 18%",
    verified: true,
    demoAvailable: true,
    deployment: "Cloud / SaaS",
    businessType: "Cross-functional Teams & Mid-Market",
    support: "24/7 Email & Support Portal",
    bestUseCase: "Project milestone planning, goal alignment (OKRs), and cross-team task coordination.",
    imageUrl: "assets/asana.png",
    variants: ["#f06a6a", "#a25ddc", "#cbd5e1"],
    features: [
      "Task dependencies mapping & critical path visualizer",
      "Universal project dashboards with real-time charting",
      "Asana intelligence for automated task description summaries",
      "Cross-project portfolios and workload management charts"
    ],
    pros: ["Superb visual timeline and dependency path flow chart", "Highly intuitive task assignment and checkoff animations", "Deep customization of workflows and custom fields"],
    cons: ["Pricing is higher than basic alternatives like Trello", "Free tier has limited collaboration options (max 10 guests)"],
    plans: [
      { name: "Starter", price: "$10.99", period: "user/month", features: ["Timeline view", "Asana Intelligence basics", "Unlimited dashboards"] },
      { name: "Advanced", price: "$24.99", period: "user/month", features: ["Workloads tracker", "Goals & portfolios", "Advanced rules builder", "Custom approvals"] }
    ],
    faqs: [
      { q: "Can we invite guest clients to our Asana projects?", a: "Yes. Guests who do not share your company's email domain can be invited for free." }
    ]
  },
  {
    id: "clickup-productivity",
    name: "ClickUp Productivity Platform",
    category: "Business Automation",
    categoryId: "business-automation",
    brand: "ClickUp",
    shortDesc: "All-in-one productivity app to replace email, chat, tasks, docs, and goal tracking in a single workspace.",
    longDesc: "ClickUp is the customizable all-in-one productivity platform designed to bring all your work into a single workspace. Manage tasks, write docs, chat with teams, configure custom spreadsheets, and track goals in one unified space.",
    rating: 4.6,
    reviewsCount: 910,
    price: 7.00,
    originalPrice: 9.00,
    priceText: "$7.00 / user / mo",
    dealHighlight: "Save 22%",
    verified: true,
    demoAvailable: true,
    deployment: "Cloud / SaaS",
    businessType: "Agile Teams & Agency Scale",
    support: "24/7 Live Chat Support",
    bestUseCase: "Consolidating multiple disconnected tech tools into one affordable platform.",
    imageUrl: "assets/clickup.png",
    variants: ["#7b68ee", "#10b981", "#cbd5e1"],
    features: [
      "Fully customized views (List, Board, Box, Calendar, Mind Map)",
      "ClickUp Docs: Collaborative doc editor with wikis",
      "ClickUp Goals: Key performance indicator target tracking",
      "Custom status pipelines per separate folders"
    ],
    pros: ["Extremely feature-rich even on basic tiers", "Outstanding value for replacing multiple apps", "Highly responsive customer update release schedule"],
    cons: ["Due to vast feature set, UI can occasionally feel overwhelming", "Platform loading speed has lagged on heavy boards"],
    plans: [
      { name: "Unlimited", price: "$7.00", period: "user/month", features: ["Unlimited storage", "Custom fields", "Gantt charts", "Email in ClickUp"] },
      { name: "Business", price: "$12.00", period: "user/month", features: ["Google SSO", "Unlimited teams", "Advanced worksheets", "Custom exports"] }
    ],
    faqs: [
      { q: "What is the Unlimited plan storage limit?", a: "The Unlimited plan provides 100% unlimited file storage space in the cloud." }
    ]
  },
  {
    id: "wrike-management",
    name: "Wrike Project Management",
    category: "Business Automation",
    categoryId: "business-automation",
    brand: "Wrike",
    shortDesc: "Robust collaborative work management platform with cross-project charts, request forms, and proofing tools.",
    longDesc: "Wrike is an enterprise-grade collaborative work management platform that helps businesses align strategy with execution. With custom request forms, visual Gantt charts, automated proofing workflows, and cross-project dashboards, it organizes work across departments.",
    rating: 4.6,
    reviewsCount: 412,
    price: 9.80,
    originalPrice: 12.00,
    priceText: "$9.80 / user / mo",
    dealHighlight: "Save 18%",
    verified: true,
    demoAvailable: true,
    deployment: "Cloud / SaaS",
    businessType: "Mid-Market & Enterprises",
    support: "24/7 Phone & Email Helpdesk",
    bestUseCase: "Agency project management, marketing asset approval, and collaborative proofing.",
    imageUrl: "assets/wrike.png",
    variants: ["#049804", "#cbd5e1"],
    features: [
      "Custom dynamic Request Forms to create tasks instantly",
      "Live collaborative proofing & files version control",
      "Cross-project workload resource management dashboards",
      "Butler and blueprint automations for repetitive campaigns"
    ],
    pros: ["Exceptional digital asset proofing and file reviews", "Strong resource utilization and workload view controllers", "High-security compliance configurations for corporate data"],
    cons: ["Requires higher tier plans to unlock key proofing features", "Interface has a more corporate, formal layout"],
    plans: [
      { name: "Team", price: "$9.80", period: "user/month", features: ["Unlimited users", "Gantt charts", "Collaborative proofing", "2 GB storage/user"] },
      { name: "Business", price: "$24.80", period: "user/month", features: ["Custom fields", "Dynamic request forms", "User groups & permissions", "Report builder"] }
    ],
    faqs: [
      { q: "Does Wrike support proofing for video files?", a: "Yes. The proofing module allows users to add frame-specific feedback on videos, PDFs, and images." }
    ]
  },
  {
    id: "figma-design",
    name: "Figma Collaborative Design",
    category: "Software Solutions",
    categoryId: "software-solutions",
    brand: "Figma",
    shortDesc: "Collaborative interface design tool to build vector UI, wireframes, prototypes, and developer specs.",
    longDesc: "Figma is the leading collaborative design platform where teams create, test, and ship products together. Design user interfaces in real-time, link frames into clickable interactive prototypes, and inspect specifications instantly with developer mode plugins.",
    rating: 4.9,
    reviewsCount: 1980,
    price: 12.00,
    originalPrice: 15.00,
    priceText: "$12.00 / editor / mo",
    dealHighlight: "20% Partner Discount",
    verified: true,
    demoAvailable: true,
    deployment: "Cloud / SaaS",
    businessType: "Designers, Developers & Agencies",
    support: "24/5 Ticket & Priority Support",
    bestUseCase: "Web and mobile user interface mockups, clickable prototypes, and dev specifications handoff.",
    imageUrl: "assets/figma.png",
    variants: ["#f24e1e", "#a259ff", "#0acf83", "#ff7262", "#1abcfe"],
    features: [
      "Real-time multiplayer vector design canvas workspace",
      "Interactive clickable prototype path connections",
      "Developer Mode: Copy CSS, Swift, or Android code specifications",
      "Figma variables and component design libraries"
    ],
    pros: ["Best collaborative vector drawing board in the market", "Saves time by replacing separate mockup and spec apps", "Extensive plugin repository for design enhancement"],
    cons: ["Dev Mode requires separate paid licenses on standard plans", "Runs entirely inside the web browser; requires stable internet"],
    plans: [
      { name: "Professional", price: "$12.00", period: "editor/month", features: ["Unlimited projects", "Shared team libraries", "Audio calls on canvas", "Dev Mode basics"] },
      { name: "Organization", price: "$45.00", period: "editor/month", features: ["Dev Mode advanced", "Org-wide libraries", "Design system analytics", "SSO/SAML admin config"] }
    ],
    faqs: [
      { q: "Can non-designers view the designs for free?", a: "Yes. Anyone can be invited as a Viewer for free to inspect designs or download assets." }
    ]
  }
];

const solutionPackages = [
  {
    id: "startup-kit",
    name: "Startup Launch Kit",
    bestFor: "Early-stage startups (5 - 15 employees)",
    price: "$299.00 / month",
    description: "Equip your startup with sales pipeline tracking, robust endpoint protection, and cloud accounting at a bundled discount.",
    included: ["Zoho CRM Plus (Standard Tiers)", "QuickBooks Online Simple Start", "Sophos Intercept X Essentials"],
    features: [
      "Advanced endpoint threat blocking support",
      "Sales pipeline automation & lead database",
      "Automated corporate invoicing & tax readiness",
      "Dedicated 1-on-1 migration consultation",
      "Single consolidated monthly invoice"
    ]
  },
  {
    id: "office-kit",
    name: "Modern Office Suite Kit",
    bestFor: "Growing corporate offices (15 - 50 employees)",
    price: "$599.00 / month",
    description: "Standardize your corporate servers computing capacity, local endpoint safety, and financial statements.",
    included: ["AWS Cloud Infrastructure Suite", "Sophos Intercept X Advanced", "QuickBooks Online Plus"],
    features: [
      "High availability web compute hosting support",
      "Advanced ransomware protection for all laptops",
      "Advanced bookkeeping with expense routing",
      "Consolidated B2B admin center",
      "Free 30-day setup assistance"
    ]
  },
  {
    id: "school-kit",
    name: "EdTech & Classroom Package",
    bestFor: "Schools, academies & training institutes",
    price: "Custom Quote",
    description: "Provide secure educational database engines, central security dashboards, and hardware configurations.",
    included: ["AWS Hosting for Portals", "Sophos Security Console", "On-demand IT Setup Service"],
    features: [
      "Compliant, secure student database records",
      "Virtual classroom tools & screen recording hosting",
      "Compliance audit logs & student data protection",
      "Specialized educational discount support",
      "24/7 dedicated school technical assistance"
    ]
  },
  {
    id: "retail-kit",
    name: "Digital Retail & POS Package",
    bestFor: "Retail stores, franchises & e-commerce brands",
    price: "$499.00 / month",
    description: "Deploy business bookkeeping, custom pipeline outreach, web servers hosting, and local endpoint protection.",
    included: ["QuickBooks Online Advanced", "Zoho CRM Plus", "Sophos Intercept X", "AWS Web Services"],
    features: [
      "POS cash drawer syncing & inventory ledger",
      "Targeted customer email marketing flows",
      "Credit card checkout malware protection",
      "High availability web hosting configuration",
      "Automated GST/Sales tax calculations"
    ]
  },
  {
    id: "security-kit",
    name: "Zero-Trust Security Package",
    bestFor: "Highly compliant firms, financial advisors & clinics",
    price: "$1,499.00 / month + Hardware",
    description: "Lockdown company data, secure physical sites, encrypt endpoint hardware, and audit user logins.",
    included: ["Cisco Secure Firewall Firepower 1000", "Sophos Intercept X Advanced with XDR", "AWS IAM & KMS Setup"],
    features: [
      "Next-gen network intrusion detection & blocking",
      "Ransomware vaccine for all device fleets",
      "Enterprise audit trailing & single sign-on integration",
      "Custom security protocol certification support",
      "Includes hardware dispatch and installation"
    ]
  },
  {
    id: "ai-kit",
    name: "AI & Automation Growth Kit",
    bestFor: "Firms looking to optimize workflows with machine learning",
    price: "$899.00 / month",
    description: "Adopt advanced GPT engines, deploy automated AI workflows, and set up analytics systems safely.",
    included: ["ChatGPT Business Enterprise", "AWS Cloud Infrastructure", "Business Automation consultancy"],
    features: [
      "Unlimited ultra-fast GPT access without training data leaks",
      "Secure custom database training capabilities",
      "Automatic code pipelines and chatbot deployment",
      "Weekly AI alignment expert consultations",
      "Comprehensive employee AI training manuals"
    ]
  }
];

const whyChooseUs = [
  {
    title: "100% Verified Products",
    description: "Every listing undergoes compliance checks, security auditing, and vendor license verification.",
    icon: "shield"
  },
  {
    title: "B2B Expert Advisor Support",
    description: "Talk to certified cloud, infrastructure, and accounting consultants who design your stack for free.",
    icon: "users"
  },
  {
    title: "Global Multi-Country Billing",
    description: "Consolidated invoices supporting global currencies, local GST/VAT compliance, and automated renewals.",
    icon: "globe"
  },
  {
    title: "Secure Payments & Escrow",
    description: "Flexible enterprise credit, wire transfers, automated credit cards, and secure transaction gateways.",
    icon: "credit-card"
  },
  {
    title: "Demo & Quote Management",
    description: "Request custom SLAs, schedule sandboxed walkthroughs, and unlock volume licensing pricing easily.",
    icon: "calendar"
  },
  {
    title: "Partnerships & Dashboard",
    description: "Unified affiliate links, recurring margins tracker, reseller discount layers, and custom quote tools.",
    icon: "briefcase"
  }
];

const resellerDashboardData = {
  stats: {
    totalLeads: 48,
    totalSales: 12,
    pendingCommission: "$1,450.00",
    paidCommission: "$5,820.00",
    conversionRate: "25.0%"
  },
  referralLink: "https://technostore360.com/ref/partner_shiyas_94",
  leads: [
    { name: "Acme Corporate", product: "Zero-Trust Security Package", date: "2026-06-02", status: "Closed Won", commission: "$450.00" },
    { name: "Apex Labs", product: "ChatGPT Business Enterprise", date: "2026-06-08", status: "Demo Scheduled", commission: "Pending" },
    { name: "EduGrow Academy", product: "School Kit", date: "2026-06-09", status: "Quote Sent", commission: "Pending" },
    { name: "TechNova Inc", product: "Office Kit", date: "2026-05-20", status: "Closed Won", commission: "$180.00" }
  ],
  marketingMaterials: [
    { title: "TechnoStore360 B2B Catalog 2026 (PDF)", type: "Brochure", size: "4.2 MB" },
    { title: "Cloud Security Package Sales Deck", type: "Presentation", size: "12.8 MB" },
    { title: "Standard Affiliate Web Banner Set", type: "Image Assets", size: "1.8 MB" }
  ]
};

const adminDashboardData = {
  stats: {
    totalRevenue: "$142,500.00",
    activeSubscriptions: 342,
    pendingSellerApprovals: 4,
    demoRequestsToday: 18,
    quoteRequestsPending: 9
  },
  recentOrders: [
    { orderId: "TS-1082", client: "Nexus Capital", product: "Cisco Secure Firewall FPR-1010", amount: "$990.00", status: "Paid", date: "2026-06-10" },
    { orderId: "TS-1081", client: "Starlight Digital", product: "Startup Launch Kit", amount: "$299.00", status: "Paid", date: "2026-06-10" },
    { orderId: "TS-1080", client: "Apex Retailers", product: "Retail Kit", amount: "$499.00", status: "Refund Pending", date: "2026-06-09" },
    { orderId: "TS-1079", client: "Helix Health", product: "Sophos Intercept X (50 seats)", date: "2026-06-08", amount: "$225.00", status: "Paid" }
  ],
  sellerApprovals: [
    { company: "CloudShield Ltd", country: "United Kingdom", category: "Cybersecurity Vendor", date: "2026-06-09", status: "Reviewing" },
    { company: "DevAuto Inc", country: "United States", category: "AI Automation Tooling", date: "2026-06-08", status: "Pending" }
  ],
  invoiceGeneration: {
    clients: ["Nexus Capital", "Starlight Digital", "Apex Retailers", "Helix Health"],
    products: ["Cisco Secure Firewall FPR-1010", "Startup Launch Kit", "Retail Kit", "Sophos Intercept X (50 seats)"]
  }
};
