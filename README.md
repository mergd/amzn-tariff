# Amazon Tariff Calculator Chrome Extension

A Chrome extension that shows the impact of proposed Trump tariffs on Amazon products imported from China. The extension identifies products from China on Amazon and displays the post-tariff price directly on the product page.

## Features

- Automatically detects products from China on Amazon product pages
- Categorizes products using Gemini Flash 1.5 AI model via OpenRouter
- Calculates tariff impact based on Trump's proposed tariff rates
- Shows post-tariff price with clear breakdown and category
- Applies tariff only to the landed cost (40% of product price)
- Uses Upstash Redis for fast caching of categorization results

## Tariff Categories and Rates

The extension uses the following tariff rates by category:

- **Electronics**: 20%
- **Furniture**: 25%
- **Apparel**: 30%
- **Footwear**: 16%
- **Toys**: 7.5%
- **Other items**: 145% (20% Fentanyl tariff + 125% Trade imbalance tariff)

## Installation

### Prerequisites

Before building the extension, you'll need:

1. An [OpenRouter](https://openrouter.ai/) API key for AI product categorization
2. [Upstash Redis](https://upstash.com/) credentials for caching (URL and token)

### Setup

1. Clone this repository
   ```
   git clone https://github.com/yourusername/amazon-tariff-calculator.git
   cd amazon-tariff-calculator
   ```

2. Install dependencies
   ```
   pnpm install
   ```

3. Create a `.env` file with your API keys (copy from example)
   ```
   cp .env.example .env
   ```
   
4. Edit the `.env` file and add your API keys:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   UPSTASH_REDIS_URL=your_upstash_redis_url_here
   UPSTASH_REDIS_TOKEN=your_upstash_redis_token_here
   ```

5. Build the extension with environment variables
   ```
   pnpm run build:env
   ```

### Loading in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select the `dist` folder from this project
4. The extension is now installed and will automatically work on Amazon product pages

## Development

- Run `pnpm run dev` to start the development server for local UI components
- Make changes to files in the `src/` directory
- Run `pnpm run build:env` to build the extension with your environment variables
- Reload the extension in Chrome to see your changes

## Technologies Used

- **React** - UI components
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Styling
- **OpenRouter & Gemini Flash 1.5** - AI-powered product categorization
- **Upstash Redis** - Fast, serverless caching
- **Chrome Extensions API** - Browser integration

## Privacy and Security

This extension:
- Does not collect or store any user data
- Only processes information about products displayed on Amazon
- Communicates with OpenRouter for product categorization and Upstash for caching
- All API keys are stored in environment variables during build, not in the extension itself

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.