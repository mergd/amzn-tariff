import { useState, useEffect } from "react";
import "../global.css";

export const Popup = () => {
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [isAmazonProduct, setIsAmazonProduct] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  
  // Check if the current tab is an Amazon product page
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      setCurrentTab(tab);
      
      // Check if URL is an Amazon product page
      const isAmazon = tab.url?.includes("amazon.") || false;
      const isProductPage = tab.url?.includes("/dp/") || tab.url?.includes("/gp/product/") || false;
      setIsAmazonProduct(isAmazon && isProductPage);
    });
    
    // Check if extension is enabled
    chrome.storage.local.get(['isEnabled'], (result) => {
      setIsEnabled(result.isEnabled !== false); // Default to true if not set
    });
  }, []);
  
  // Toggle the extension on/off
  const toggleExtension = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    
    chrome.storage.local.set({ isEnabled: newState }, () => {
      // Reload the current tab to apply changes
      if (currentTab?.id) {
        chrome.tabs.reload(currentTab.id);
      }
    });
  };
  
  // Open options page
  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };
  
  // Refresh tariff calculation on current page
  const refreshTariff = () => {
    if (currentTab?.id) {
      chrome.tabs.sendMessage(currentTab.id, { action: 'refreshTariff' });
    }
  };
  
  return (
    <div className="w-64 p-4">
      <h1 className="text-lg font-bold mb-4">Amazon Tariff Calculator</h1>
      
      {isAmazonProduct ? (
        <div>
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="text-sm mr-2">Show Tariff Information:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isEnabled}
                  onChange={toggleExtension}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <button 
              onClick={refreshTariff}
              className="w-full py-1 px-3 bg-blue-100 text-blue-800 text-sm rounded-md hover:bg-blue-200 mb-2"
            >
              Refresh Tariff Calculation
            </button>
          </div>
          
          <div className="text-xs bg-yellow-50 p-2 rounded-md mb-4">
            <p className="font-semibold mb-1">Trump Tariff Rates:</p>
            <ul className="list-disc pl-4 text-gray-700">
              <li>Electronics: 20%</li>
              <li>Furniture: 25%</li>
              <li>Apparel: 30%</li>
              <li>Footwear: 16%</li>
              <li>Toys: 7.5%</li>
              <li>Other: 145%</li>
            </ul>
            <p className="mt-1 text-gray-600">Applied to 40% of product price (estimated landed cost)</p>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-600 mb-4">
          This extension only works on Amazon product pages.
        </div>
      )}
      
      <button
        onClick={openOptionsPage}
        className="w-full py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
      >
        Open Settings
      </button>
    </div>
  );
};

export default Popup;