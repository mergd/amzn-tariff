// Content script for Amazon Tariffs extension
// Runs on Amazon product pages and injects tariff information

interface ProductInfo {
  title: string;
  price: number;
  countryOfOrigin: string | null;
}

interface TariffInfo {
  rate: number;
  category: string;
  isFallback: boolean;
}

// Get the product title from the page
function getProductTitle(): string {
  const titleElement = document.getElementById('productTitle');
  return titleElement ? titleElement.textContent?.trim() || '' : '';
}

// Get the product price from the page
function getProductPrice(): number | null {
  const priceElement = document.querySelector('.a-price .a-offscreen');
  if (!priceElement) return null;
  
  const priceText = priceElement.textContent || '';
  const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
  return isNaN(price) ? null : price;
}

// Get country of origin from the product details section
function getCountryOfOrigin(): string | null {
  // Check product details section for country of origin
  const detailsElements = document.querySelectorAll('#detailBullets_feature_div li, #productDetails_detailBullets_sections1 tr, #prodDetails .prodDetSectionEntry');
  
  for (const element of detailsElements) {
    const text = element.textContent || '';
    if (text.toLowerCase().includes('country of origin') || text.toLowerCase().includes('origin country')) {
      // Extract country name
      const match = text.match(/origin\s*[:\s]\s*([^,\n]+)/i) || 
                   text.match(/country\s+of\s+origin\s*[:\s]\s*([^,\n]+)/i);
      return match ? match[1].trim() : null;
    }
  }
  
  // Check the technical details section
  const techDetails = document.querySelectorAll('.techDetailsList .techDetailsListItem');
  for (const item of techDetails) {
    const text = item.textContent || '';
    if (text.toLowerCase().includes('country of origin') || text.toLowerCase().includes('origin country')) {
      const match = text.match(/origin\s*[:\s]\s*([^,\n]+)/i) || 
                   text.match(/country\s+of\s+origin\s*[:\s]\s*([^,\n]+)/i);
      return match ? match[1].trim() : null;
    }
  }
  
  return null;
}

// Calculate the tariff percentage based on product title and category
async function calculateTariff(productInfo: ProductInfo): Promise<TariffInfo> {
  // Send a message to the background script to get the tariff calculation
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      action: 'calculateTariff',
      productInfo
    }, (response) => {
      resolve(response);
    });
  });
}

// Create the tariff UI element
function createTariffElement(price: number, tariffInfo: TariffInfo): HTMLElement {
  const tariffRate = tariffInfo.rate / 100;
  // Tariff only affects 2/5 of the value (landed cost)
  const landedCostRatio = 0.4; 
  const tariffAmount = price * landedCostRatio * tariffRate;
  const postTariffPrice = price + tariffAmount;
  
  const container = document.createElement('div');
  container.className = 'amazon-tariff-info';
  container.style.cssText = 'margin: 10px 0; padding: 10px; border: 1px solid #e7e7e7; border-radius: 4px; background-color: #f8f8f8;';
  
  let tariffDescription = '';
  if (tariffInfo.isFallback) {
    tariffDescription = `
      <span style="font-weight: bold; color: #d00;">Trump Tariff: ${tariffInfo.rate}%</span> 
      <span style="color: #555;">(20% Fentanyl + 125% Trade Imbalance)</span>
    `;
  } else {
    tariffDescription = `
      <span style="font-weight: bold; color: #d00;">Trump Tariff: ${tariffInfo.rate}%</span> 
      <span style="color: #555;">(Category: ${tariffInfo.category})</span>
    `;
  }
  
  container.innerHTML = `
    <div style="font-size: 14px; margin-bottom: 6px;">${tariffDescription}</div>
    <div style="font-size: 18px; font-weight: bold;">
      Post-Tariff Price: $${postTariffPrice.toFixed(2)}
      <span style="font-size: 14px; color: #d00; margin-left: 8px;">
        (+ $${tariffAmount.toFixed(2)})
      </span>
    </div>
    <div style="font-size: 12px; color: #555; margin-top: 4px;">
      Tariff calculated on 40% landed cost value
    </div>
  `;
  
  return container;
}

// Main function to inject tariff information
async function injectTariffInfo() {
  // Check if extension is enabled
  const { isEnabled } = await chrome.storage.local.get(['isEnabled']);
  if (isEnabled === false) return;
  
  const title = getProductTitle();
  const price = getProductPrice();
  const countryOfOrigin = getCountryOfOrigin();
  
  // If we have all the required information
  if (title && price !== null) {
    const productInfo: ProductInfo = {
      title,
      price,
      countryOfOrigin
    };
    
    // Only process if origin is China or unknown (can be set in options later)
    if (countryOfOrigin === null || countryOfOrigin.toLowerCase().includes('china')) {
      const tariffInfo = await calculateTariff(productInfo);
      
      // Create and inject tariff element
      const tariffElement = createTariffElement(price, tariffInfo);
      
      // Find pricing element to insert after
      const pricingElement = document.querySelector('.a-price-whole')?.closest('.a-section') ||
                            document.querySelector('#corePriceDisplay_desktop_feature_div');
      
      if (pricingElement) {
        // Check if we already added the element
        const existingElement = document.querySelector('.amazon-tariff-info');
        if (existingElement) {
          existingElement.parentNode?.removeChild(existingElement);
        }
        
        // Insert after pricing element
        pricingElement.parentNode?.insertBefore(tariffElement, pricingElement.nextSibling);
      }
    }
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'refreshTariff') {
    injectTariffInfo();
  }
});

// Run on page load and then set up mutation observer to check for dynamic content changes
window.addEventListener('load', () => {
  // Initial run
  injectTariffInfo();
  
  // Set up mutation observer to detect price or product info changes
  const observer = new MutationObserver(() => {
    injectTariffInfo();
  });
  
  // Observe body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});