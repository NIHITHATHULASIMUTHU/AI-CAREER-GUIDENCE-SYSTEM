import { useState } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";

export function CareerGuidanceSystem() {
  const [activeTab, setActiveTab] = useState<"create" | "history">("create");
  const profiles = useQuery(api.profiles.getUserProfiles) || [];
  const recommendations = useQuery(api.recommendations.getUserRecommendations) || [];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("create")}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === "create"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Create Profile
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === "history"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          History ({recommendations.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "create" && <CreateProfileForm />}
      {activeTab === "history" && <RecommendationHistory recommendations={recommendations} />}
    </div>
  );
}

function CreateProfileForm() {
  const [interests, setInterests] = useState("");
  const [skills, setSkills] = useState("");
  const [knowledge, setKnowledge] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRecommendation, setCurrentRecommendation] = useState<any>(null);

  // Default options
  const defaultInterests = [
    "Technology and Innovation",
    "Problem-solving and Analytics", 
    "Creative Design and Arts",
    "Working with People",
    "Healthcare and Medicine",
    "Business and Entrepreneurship",
    "Education and Teaching",
    "Environmental and Sustainability",
    "Sports and Fitness",
    "Research and Science",
    "Finance and Economics",
    "Marketing and Communication",
    "Engineering and Construction",
    "Law and Justice",
    "Travel and Culture"
  ];

  const defaultSkills = [
    "Programming and Software Development",
    "Communication and Presentation",
    "Leadership and Team Management",
    "Analytical and Critical Thinking",
    "Project Management",
    "Creative Problem Solving",
    "Data Analysis and Statistics",
    "Customer Service",
    "Sales and Negotiation",
    "Research and Investigation",
    "Writing and Content Creation",
    "Design and Visual Arts",
    "Mathematical and Quantitative Skills",
    "Foreign Languages",
    "Technical Troubleshooting"
  ];

  const defaultKnowledge = [
    "Computer Science and IT",
    "Mathematics and Statistics",
    "Business Administration",
    "Psychology and Human Behavior",
    "Engineering (Mechanical/Electrical/Civil)",
    "Medicine and Healthcare",
    "Marketing and Digital Media",
    "Finance and Accounting",
    "Education and Pedagogy",
    "Environmental Science",
    "Law and Legal Studies",
    "Arts and Design",
    "Biology and Life Sciences",
    "Physics and Chemistry",
    "History and Social Sciences"
  ];

  const createProfile = useMutation(api.profiles.createProfile);
  const generateRecommendations = useAction(api.recommendations.generateCareerRecommendations);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!interests.trim() || !skills.trim() || !knowledge.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsGenerating(true);
    try {
      // Create profile
      const profileId = await createProfile({
        interests: interests.trim(),
        skills: skills.trim(),
        knowledge: knowledge.trim(),
      });

      // Generate recommendations
      const result = await generateRecommendations({ profileId });
      
      // Parse and display the recommendations
      setCurrentRecommendation(result.rawResponse);
      
      toast.success("Career recommendations generated successfully!");
      
      // Clear form
      setInterests("");
      setSkills("");
      setKnowledge("");
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast.error("Failed to generate recommendations. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to convert markdown-style bold to HTML
  const formatText = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  // Function to add selected option to text area
  const addToField = (value: string, currentValue: string, setter: (value: string) => void) => {
    if (currentValue.includes(value)) return; // Don't add duplicates
    
    const newValue = currentValue 
      ? `${currentValue}, ${value}`
      : value;
    setter(newValue);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Student Profile</h2>
        
        {/* Interests Section */}
        <div>
          <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
            Interests
          </label>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Quick select (click to add):</p>
            <div className="flex flex-wrap gap-2">
              {defaultInterests.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => addToField(interest, interests, setInterests)}
                  className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                  disabled={isGenerating}
                >
                  + {interest}
                </button>
              ))}
            </div>
          </div>
          <textarea
            id="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="Select from above or type your own interests..."
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow resize-none"
            rows={3}
            disabled={isGenerating}
          />
        </div>

        {/* Skills Section */}
        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
            Skills
          </label>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Quick select (click to add):</p>
            <div className="flex flex-wrap gap-2">
              {defaultSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => addToField(skill, skills, setSkills)}
                  className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors border border-green-200"
                  disabled={isGenerating}
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>
          <textarea
            id="skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Select from above or type your own skills..."
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow resize-none"
            rows={3}
            disabled={isGenerating}
          />
        </div>

        {/* Knowledge Areas Section */}
        <div>
          <label htmlFor="knowledge" className="block text-sm font-medium text-gray-700 mb-2">
            Knowledge Areas
          </label>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Quick select (click to add):</p>
            <div className="flex flex-wrap gap-2">
              {defaultKnowledge.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => addToField(area, knowledge, setKnowledge)}
                  className="px-3 py-1 text-xs bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors border border-purple-200"
                  disabled={isGenerating}
                >
                  + {area}
                </button>
              ))}
            </div>
          </div>
          <textarea
            id="knowledge"
            value={knowledge}
            onChange={(e) => setKnowledge(e.target.value)}
            placeholder="Select from above or type your own knowledge areas..."
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow resize-none"
            rows={3}
            disabled={isGenerating}
          />
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generating Recommendations...</span>
            </div>
          ) : (
            "Generate Career Recommendations"
          )}
        </button>
      </form>

      {currentRecommendation && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Career Recommendations</h2>
          <div className="prose max-w-none">
            <div 
              className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatText(currentRecommendation) }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationHistory({ recommendations }: { recommendations: any[] }) {
  if (recommendations.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
        <p className="text-gray-500">No recommendations yet. Create your first profile to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">Recommendation History</h2>
      {recommendations.map((recommendation) => (
        <RecommendationCard key={recommendation._id} recommendation={recommendation} />
      ))}
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Career Recommendations
          </h3>
          <p className="text-sm text-gray-500">
            Generated on {new Date(recommendation.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          {isExpanded ? "Collapse" : "View Details"}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {recommendation.careerOptions.map((option: any, index: number) => (
            <div key={index} className="border-l-4 border-primary pl-4 py-2">
              <h4 className="font-semibold text-gray-900">
                <strong>Option {option.letter}:</strong> {option.careerName}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{option.whyItMatches}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                <span><strong>Skills:</strong> {option.keyRequiredSkills}</span>
                <span><strong>Growth:</strong> {option.futureGrowthLevel}</span>
              </div>
            </div>
          ))}
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <h4 className="font-semibold text-green-800">
              <strong>Best Recommended Option:</strong> {recommendation.bestRecommendation.optionLetter}
            </h4>
            <p className="text-sm text-green-700 mt-1">{recommendation.bestRecommendation.reason}</p>
          </div>
        </div>
      )}
    </div>
  );
}
