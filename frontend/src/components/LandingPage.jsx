import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Logo Component using the icon.svg
const Logo = ({ className, size = "md" }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-20 h-20",
  };
  return (
    <img
      src="/icon.svg"
      alt="InsightForge"
      className={`${sizes[size]} ${className || ""}`}
    />
  );
};

// Icons
const ChartIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const SparklesIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  </svg>
);

const UploadIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);

const LightningIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

const DocumentIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const CompareIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
    />
  </svg>
);

const ShieldIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14 5l7 7m0 0l-7 7m7-7H3"
    />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const StarIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const PlayIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

/**
 * Landing Page Component for InsightForge
 */
function LandingPage() {
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: LightningIcon,
      title: "AI-Powered Analysis",
      description:
        "Advanced machine learning algorithms analyze your data in seconds, uncovering patterns and insights humans might miss.",
      color: "indigo",
    },
    {
      icon: DocumentIcon,
      title: "Professional Reports",
      description:
        "Generate beautiful PDF and PowerPoint reports automatically, ready for presentations and stakeholder meetings.",
      color: "purple",
    },
    {
      icon: CompareIcon,
      title: "File Comparison",
      description:
        "Compare multiple Excel files side by side, track changes, and identify discrepancies effortlessly.",
      color: "pink",
    },
    {
      icon: ShieldIcon,
      title: "Enterprise Security",
      description:
        "Your data is encrypted and processed securely. We never store your files longer than necessary.",
      color: "emerald",
    },
    {
      icon: ClockIcon,
      title: "Real-Time Processing",
      description:
        "No waiting around. Get instant results as soon as you upload your files.",
      color: "amber",
    },
    {
      icon: ChartIcon,
      title: "Visual Insights",
      description:
        "Interactive charts and visualizations make complex data easy to understand at a glance.",
      color: "cyan",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Upload Your Data",
      description:
        "Drag and drop your Excel files or click to browse. We support .xlsx, .xls, and .csv formats.",
    },
    {
      number: "02",
      title: "AI Analyzes",
      description:
        "Our advanced AI processes your data, identifying trends, anomalies, and key metrics automatically.",
    },
    {
      number: "03",
      title: "Get Insights",
      description:
        "Review AI-generated insights, charts, and recommendations tailored to your specific data.",
    },
    {
      number: "04",
      title: "Export Reports",
      description:
        "Download professional PDF or PowerPoint reports ready for presentations and decision-making.",
    },
  ];

  const testimonials = [
    {
      quote:
        "InsightForge cut our reporting time from 3 days to 30 minutes. The AI insights have transformed how we approach data analysis.",
      author: "Sarah Chen",
      role: "Head of Analytics, TechCorp",
      avatar: "SC",
    },
    {
      quote:
        "The file comparison feature alone saved us countless hours of manual checking. Absolutely essential for our finance team.",
      author: "Michael Roberts",
      role: "CFO, Global Industries",
      avatar: "MR",
    },
    {
      quote:
        "Finally, a tool that makes data analysis accessible to everyone on our team, not just the data scientists.",
      author: "Emily Watson",
      role: "Operations Director, StartupXYZ",
      avatar: "EW",
    },
  ];

  const stats = [
    { value: "10M+", label: "Rows Processed" },
    { value: "50K+", label: "Reports Generated" },
    { value: "99.9%", label: "Uptime" },
    { value: "<5s", label: "Avg. Analysis Time" },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <Logo size="md" className="rounded-xl" />
              <div>
                <h1 className="text-lg font-bold text-white">InsightForge</h1>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                How it Works
              </a>
              {/* <a href="#testimonials" className="text-sm text-slate-400 hover:text-white transition-colors">Testimonials</a> */}
            </div>
            <Link
              to="/home"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-3xl"></div>
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNNDAgMEgwdjQwaDQwVjB6TTEgMWgzOHYzOEgxVjF6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm text-white text-sm font-medium mb-8 border border-white/10 animate-fade-in">
              <SparklesIcon className="w-4 h-4 text-amber-400" />
              <span>AI-Powered Business Intelligence Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight animate-fade-in-up">
              Transform Your Data Into
              <span className="block mt-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Actionable Insights
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in-up stagger-1">
              Upload your Excel files and let our AI analyze, visualize, and
              generate professional reports in seconds. No data science
              expertise required.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up stagger-2">
              <Link
                to="/home"
                className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 hover:-translate-y-1 flex items-center gap-3"
              >
                Start Analyzing Free
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="group px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300 flex items-center gap-3">
                <PlayIcon className="w-5 h-5" />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in-up stagger-3">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div> */}
          </div>

          {/* Hero Visual */}
          <div className="mt-20 relative animate-fade-in-up stagger-4">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10"></div>
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 bg-gradient-to-br from-slate-900 to-slate-800">
              <div className="p-1">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/80 rounded-t-2xl border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="h-7 bg-slate-800 rounded-lg flex items-center px-3">
                      <span className="text-xs text-slate-500">
                        insightforge.app
                      </span>
                    </div>
                  </div>
                </div>
                {/* App Preview */}
                <div className="p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Upload Card */}
                    <div className="p-6 rounded-2xl bg-slate-800/50 border border-white/5">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4">
                        <UploadIcon className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">
                        Upload Files
                      </h3>
                      <p className="text-sm text-slate-500">
                        Drag & drop your Excel files
                      </p>
                    </div>
                    {/* Analysis Card */}
                    <div className="p-6 rounded-2xl bg-slate-800/50 border border-white/5">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                        <SparklesIcon className="w-6 h-6 text-purple-400" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">
                        AI Analysis
                      </h3>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-shimmer"></div>
                      </div>
                    </div>
                    {/* Report Card */}
                    <div className="p-6 rounded-2xl bg-slate-800/50 border border-white/5">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                        <DocumentIcon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">
                        Reports Ready
                      </h3>
                      <p className="text-sm text-slate-500">
                        PDF & PowerPoint export
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20" id="features-header" data-animate>
            <div
              className={`transition-all duration-700 ${isVisible["features-header"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-4 border border-indigo-500/20">
                Features
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Everything You Need for
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  Data Excellence
                </span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Powerful features designed to transform how you work with data,
                from upload to insight.
              </p>
            </div>
          </div>

          <div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            id="features-grid"
            data-animate
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-8 rounded-3xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 ${isVisible["features-grid"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-${feature.color}-500/10 group-hover:bg-${feature.color}-500/20 transition-colors`}
                >
                  <feature.icon
                    className={`w-7 h-7 text-${feature.color}-400`}
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900"></div>
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20" id="steps-header" data-animate>
            <div
              className={`transition-all duration-700 ${isVisible["steps-header"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium mb-4 border border-purple-500/20">
                How It Works
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                From Data to Insights
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  In Four Simple Steps
                </span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                No complex setup. No learning curve. Just upload and let the AI
                do the heavy lifting.
              </p>
            </div>
          </div>

          <div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            id="steps-grid"
            data-animate
          >
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-3xl bg-gradient-to-br from-slate-800/30 to-transparent border border-white/5 transition-all duration-700 ${isVisible["steps-grid"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-400">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-indigo-500/50 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {/* <section id="testimonials" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20" id="testimonials-header" data-animate>
            <div className={`transition-all duration-700 ${isVisible["testimonials-header"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-sm font-medium mb-4 border border-amber-500/20">
                Testimonials
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Loved by Data Teams
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                  Worldwide
                </span>
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8" id="testimonials-grid" data-animate>
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`p-8 rounded-3xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/5 transition-all duration-700 ${isVisible["testimonials-grid"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNNDAgMEgwdjQwaDQwVjB6TTEgMWgzOHYzOEgxVjF6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Logo
            size="xl"
            className="mx-auto mb-8 rounded-3xl shadow-2xl shadow-indigo-500/30"
          />
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to Transform
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Your Data Workflow?
            </span>
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join thousands of professionals who've already revolutionized their
            data analysis process.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/home"
              className="group px-10 py-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 hover:-translate-y-1 flex items-center gap-3"
            >
              Get Started Now — It's Free
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-emerald-400" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-emerald-400" />
              Free to start
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-emerald-400" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <Logo size="md" className="rounded-xl" />
              <div>
                <p className="font-bold text-white">InsightForge</p>
                <p className="text-xs text-slate-500">
                  AI-Powered Business Intelligence
                </p>
              </div>
            </Link>
            {/* <div className="flex items-center gap-8 text-sm text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div> */}
            <p className="text-sm text-slate-600">
              © 2026 InsightForge. All rights reserved. Built by{" "}
              <span className="text-sm text-slate-300">
                <a
                  href="https://yarvix.space"
                  target="_blank"
                  className="font-bold"
                >
                  YarvixTech
                </a>
              </span>{" "}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
