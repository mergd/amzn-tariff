import { useState, useEffect } from "react";
import "../global.css";
import { ENV } from "../../config";

const Options = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  
  // Load saved settings on component mount
  useEffect(() => {
    chrome.storage.local.get(['isEnabled'], (result) => {
      if (result.isEnabled !== undefined) setIsEnabled(result.isEnabled);
    });
  }, []);
  
  // Save settings
  const saveSettings = () => {
    chrome.storage.local.set({
      isEnabled
    }, () => {
      setSaveStatus('Settings saved successfully! Please reload any open Amazon tabs.');
      setTimeout(() => setSaveStatus(''), 5000);
    });
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Amazon Tariff Calculator Settings</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Extension Settings</h2>
        
        <div className="flex items-center mb-4">
          <span className="text-sm mr-2">Enable Tariff Calculator:</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={isEnabled}
              onChange={() => setIsEnabled(!isEnabled)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <p className="text-sm text-gray-600">
          When enabled, the extension will automatically show tariff information for products from China on Amazon product pages.
        </p>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Advanced Information</h2>
        <div className="text-sm text-gray-600">
          <p className="mb-2">This extension uses the following technologies:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>Gemini Flash 1.5 AI model for product categorization</li>
            <li>Upstash Redis for fast caching of tariff calculations</li>
            <li>OpenRouter as the AI gateway service</li>
          </ul>
          <p>All API access is configured through the extension and doesn't require any user setup.</p>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">About Trump Tariffs</h2>
        <p className="text-sm text-gray-600 mb-2">
          This extension shows the potential impact of proposed Trump tariffs on products from China:
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-600 mb-4">
          <li>Electronics: 20%</li>
          <li>Furniture: 25%</li>
          <li>Apparel: 30%</li>
          <li>Footwear: 16%</li>
          <li>Toys: 7.5%</li>
          <li>Other items: 145% (20% Fentanyl tariff + 125% Trade imbalance tariff)</li>
        </ul>
        <p className="text-sm text-gray-600">
          Tariffs are applied only to the landed cost, estimated at 40% of the product price.
        </p>
      </div>
      
      <div className="flex justify-end">
        <button 
          onClick={saveSettings}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Settings
        </button>
      </div>
      
      {saveStatus && (
        <div className="mt-4 p-2 bg-green-100 text-green-700 rounded-md text-center">
          {saveStatus}
        </div>
      )}
      
      <div className="mt-6 text-xs text-gray-500 text-center">
        Amazon Tariff Calculator v1.0 | Using AI Model: {ENV.AI_MODEL}
      </div>
    </div>
  );
};

export default Options;