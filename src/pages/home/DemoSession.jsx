import { FileText, MessageCircle, Mic } from "lucide-react";
import React from "react";

const DemoSession = () => {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-6xl mx-auto">
          <header className="flex justify-between items-center pb-6 border-b border-gray-300 dark:border-gray-700">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">
              Live Demo - Dental Scribe in Action
            </h1>
            <button className="text-sm bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors">
              <Mic size={20} className="me-2" />
              Start Recording
            </button>
          </header>
          <main className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div className="space-y-4">
              <h2 className="text-md font-semibold text-gray-700 dark:text-gray-300 flex items-center ">
                <MessageCircle size={20} className="me-2" />
                Live Transcription
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border-l-4 border-teal-500">
                  <p className="font-semibold text-teal-600 dark:text-teal-400 text-md">
                    Dr. Smith
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Good morning! How are you feeling today?
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border-l-4 border-indigo-500">
                  <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                    Patient
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    I've been having some sensitivity on my upper left molar.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border-l-4 border-teal-500">
                  <p className="font-semibold text-teal-600 dark:text-teal-400">
                    Dr. Smith
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    I can see some plaque buildup along the gum line.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-md font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                <FileText size={20} className="me-2" />
                Clinical Notes (SOAP)
              </h2>
              <div className="space-y-2">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
                    htmlFor="subjective"
                  >
                    Subjective
                  </label>
                  <textarea
                    className="w-full h-20 p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700"
                    id="subjective"
                    rows="4"
                    readOnly
                  >
                    Patient reports sensitivity on upper left molar when
                    consuming cold beverages. No pain at rest.
                  </textarea>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
                    htmlFor="objective"
                  >
                    Objective
                  </label>
                  <textarea
                    className="w-full h-20 p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700"
                    id="objective"
                    rows="4"
                    readOnly
                  >
                    Clinical examination reveals mild recession on tooth #14
                    with exposed root surface. No caries detected.
                  </textarea>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
                    htmlFor="assessment"
                  >
                    Assessment
                  </label>
                  <textarea
                    className="w-full h-16 p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700"
                    id="assessment"
                    rows="4"
                    readOnly
                  >
                    Dentin hypersensitivity on tooth #14 due to gingival
                    recession.
                  </textarea>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
                    htmlFor="plan"
                  >
                    Plan
                  </label>
                  <textarea
                    className="w-full h-20 p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700"
                    id="plan"
                    rows="4"
                    readOnly
                  >
                    Apply desensitizing agent. Recommend fluoride toothpaste for
                    sensitive teeth. Follow-up in 2 weeks.
                  </textarea>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
};

export default DemoSession;
