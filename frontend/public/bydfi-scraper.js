// BYDFI Position Scraper for Tiger Hunt Pro Dashboard
// Copy and paste this script into your BYDFI browser console while on the positions page

(function() {
  console.log('🐅 Tiger Hunt Pro - BYDFI Position Scraper Started');
  console.log('📊 Dashboard URL: https://tigerhunt-pro-frontend-ivory.vercel.app/dashboard');
  
  // Configuration
  const DASHBOARD_API = 'https://tigerhunt-pro-backend-k742.vercel.app/api/bydfi-positions';
  const SCRAPE_INTERVAL = 10000; // 10 seconds
  
  let isRunning = false;
  let intervalId = null;
  
  // Function to extract account data from BYDFI page
  function extractAccountData() {
    try {
      console.log('💰 Scanning BYDFI account data...');
      
      const accountData = {
        balance: '0',
        pnl: '0',
        marginRatio: '0.00%',
        maintenanceMargin: '0',
        marginBalance: '0',
        vipLevel: '0',
        makerFee: '0.02%',
        takerFee: '0.06%'
      };
      
      // Try to find balance information
      const balanceSelectors = [
        '*[class*="balance"]',
        '*[class*="Balance"]',
        '*[class*="asset"]',
        '*[class*="Asset"]',
        'span:contains("USDT")',
        'div:contains("USDT")'
      ];
      
             // ONLY look for Assets section - NOT Contract Details
       let assetsSection = null;
       
       // Try multiple ways to find Assets section
       const assetSelectors = [
         '*[class*="asset"]',
         '*:contains("Assets")',
         '*:contains("Balance")',
         '*[class*="balance"]',
         '*[class*="pnl"]',
         '*:contains("P&L")',
         'div:contains("10,133.38")', // Your specific balance
         'div:contains("0.00 USDT")'  // Your specific PnL
       ];
       
       for (const selector of assetSelectors) {
         try {
           const elements = document.querySelectorAll(selector);
           if (elements.length > 0) {
             // Find the one that contains both balance and PnL
             for (const element of elements) {
               const text = element.textContent || '';
               if (text.includes('USDT') && (text.includes('Balance') || text.includes('10,') || text.includes('0.00'))) {
                 assetsSection = element;
                 console.log('🎯 Found Assets section using selector:', selector);
                 break;
               }
             }
             if (assetsSection) break;
           }
         } catch (e) {
           // Ignore selector errors
         }
       }
       
       let elementsToSearch = [];
       
       if (assetsSection) {
         // If we found Assets section, only search within it
         elementsToSearch = assetsSection.querySelectorAll('*');
         console.log('🎯 Found Assets section, searching within it only');
       } else {
         // Fallback: search all but be more specific
         elementsToSearch = document.querySelectorAll('*');
         console.log('⚠️ Assets section not found, using fallback search');
       }
       
       // Track what we find to avoid Contract Details
       let foundBalance = false;
       let foundPnL = false;
       
       elementsToSearch.forEach(element => {
         const text = element.textContent?.trim() || '';
         const parentText = element.parentElement?.textContent?.toLowerCase() || '';
         
         // SKIP if it's in Contract Details section
         if (parentText.includes('contract') || parentText.includes('index') || 
             parentText.includes('mark') || parentText.includes('volume') ||
             text.includes('Index') || text.includes('Mark') || text.includes('Volume')) {
           return; // Skip Contract Details
         }
         
         // Look for balance ONLY in Assets context
         if (!foundBalance && /^\d{1,3}(,\d{3})*(\.\d{2})?\s*(USDT|USD)$/i.test(text)) {
           // Check if this is likely the main balance (usually the largest value in Assets)
           if (parentText.includes('balance') || parentText.includes('asset')) {
             const value = text.replace(/[,$A-Za-z\s]/g, '');
             accountData.balance = value;
             foundBalance = true;
             console.log('💰 Found balance in Assets section:', value);
           }
         }
         
         // Look for PnL - more specific patterns
         if (!foundPnL && /^[+-]?\d+(\.\d{2})?\s*(USDT|USD)?$/i.test(text)) {
           // Check if this is likely PnL (near "PnL" text or in Assets section)
           if (parentText.includes('pnl') || parentText.includes('p&l') || 
               (parentText.includes('asset') && text.includes('0.00'))) {
             const value = text.replace(/[A-Za-z\s]/g, '');
             accountData.pnl = value;
             foundPnL = true;
             console.log('📊 Found PnL in Assets section:', value);
           }
         }
        
                 // Look for percentage (margin ratio) - but NOT from Contract Details
         if (/^\d+(\.\d{2})?%$/i.test(text)) {
           // Only accept if it's NOT in contract details and is a small percentage (margin ratios are usually small)
           if (!parentText.includes('contract') && !parentText.includes('volume') && parseFloat(text) < 50) {
             accountData.marginRatio = text;
             console.log('📋 Found margin ratio:', text);
           }
         }
        
        // Look for VIP level
        if (/^VIP\s*\d+$/i.test(text)) {
          accountData.vipLevel = text.replace(/VIP\s*/i, '');
          console.log('⭐ Found VIP level:', accountData.vipLevel);
        }
        
        // Look for maker/taker fees
        if (/Maker:\s*\d+(\.\d{2})?%/i.test(text)) {
          const match = text.match(/Maker:\s*(\d+(?:\.\d{2})?)%/i);
          if (match) {
            accountData.makerFee = match[1] + '%';
            console.log('💼 Found maker fee:', accountData.makerFee);
          }
        }
        
        if (/Taker:\s*\d+(\.\d{2})?%/i.test(text)) {
          const match = text.match(/Taker:\s*(\d+(?:\.\d{2})?)%/i);
          if (match) {
            accountData.takerFee = match[1] + '%';
            console.log('💼 Found taker fee:', accountData.takerFee);
          }
        }
      });
      
             // Summary of what we found
       console.log('📋 Assets extraction summary:');
       console.log(`💰 Balance: ${accountData.balance} USDT`);
       console.log(`📊 PnL: ${accountData.pnl} USDT`);
       console.log(`⚖️ Margin Ratio: ${accountData.marginRatio}`);
       console.log(`⭐ VIP Level: ${accountData.vipLevel}`);
       console.log('🚫 Contract Details SKIPPED (Index Price, Mark, Volume)');
       
       return accountData;
      
    } catch (error) {
      console.error('❌ Error extracting account data:', error);
      return null;
    }
  }

  // Function to extract positions from BYDFI page
  function extractPositions() {
    try {
      console.log('🔍 Scanning BYDFI positions...');
      
      // Check if we're on the right page
      if (!window.location.hostname.includes('bydfi.com')) {
        console.error('❌ Please run this script on BYDFI.com');
        return [];
      }
      
      const positions = [];
      
      // Try different selectors that might contain position data
      const possibleSelectors = [
        'table tbody tr',           // Standard table rows
        '.position-row',            // Custom position rows
        '[data-testid*="position"]', // Test ID attributes
        '.futures-position',        // Futures specific
        '.position-item',           // Position items
        'tr[role="row"]'            // Table rows with role
      ];
      
      let foundPositions = false;
      
      for (const selector of possibleSelectors) {
        const rows = document.querySelectorAll(selector);
        
        if (rows.length > 0) {
          console.log(`📋 Found ${rows.length} potential position rows with selector: ${selector}`);
          
          rows.forEach((row, index) => {
            try {
              // Extract text content from all cells
              const cells = row.querySelectorAll('td, .cell, [class*="cell"], [class*="col"]');
              
              if (cells.length >= 6) { // Minimum expected columns
                const cellTexts = Array.from(cells).map(cell => 
                  cell.textContent?.trim() || ''
                ).filter(text => text && text !== '--' && text !== '-');
                
                // Try to identify the position data
                const position = extractPositionFromCells(cellTexts);
                
                if (position && position.symbol) {
                  positions.push(position);
                  foundPositions = true;
                  console.log(`✅ Position extracted: ${position.symbol} | ${position.qty} | PnL: ${position.unrealizedPnl}`);
                }
              }
            } catch (error) {
              console.warn(`⚠️ Error processing row ${index}:`, error);
            }
          });
          
          if (foundPositions) break; // Stop if we found positions
        }
      }
      
      // If no positions found with table selectors, try alternative methods
      if (!foundPositions) {
        console.log('🔍 Trying alternative extraction methods...');
        
        // Look for "No Data" or empty state
        const noDataElements = document.querySelectorAll('*');
        for (const element of noDataElements) {
          const text = element.textContent?.toLowerCase() || '';
          if (text.includes('no data') || text.includes('no position') || text.includes('empty')) {
            console.log('📭 No positions found (empty state detected)');
            return [];
          }
        }
        
        // Try to find any elements that might contain position data
        const allElements = document.querySelectorAll('*');
        const potentialData = [];
        
        allElements.forEach(element => {
          const text = element.textContent?.trim() || '';
          // Look for cryptocurrency symbols
          if (/^[A-Z]{3,}(USDT|USD|BTC|ETH)$/i.test(text)) {
            potentialData.push(text);
          }
        });
        
        if (potentialData.length > 0) {
          console.log('🔍 Potential symbols found:', potentialData);
        }
      }
      
      return positions;
      
    } catch (error) {
      console.error('❌ Error extracting positions:', error);
      return [];
    }
  }
  
  // Function to parse position data from cell texts
  function extractPositionFromCells(cellTexts) {
    try {
      // Common patterns for different data
      const symbolPattern = /^[A-Z]{3,}(USDT|USD|BTC|ETH)$/i;
      const pricePattern = /^\$?[\d,]+\.?\d*$/;
      const pnlPattern = /^[+-]?\$?[\d,]+\.?\d*$/;
      const percentPattern = /^[+-]?\d+\.?\d*%$/;
      
      const position = {
        symbol: '',
        qty: '',
        entryPrice: '',
        markPrice: '',
        liqPrice: '',
        unrealizedPnl: '',
        unrealizedRoi: '',
        positionPnl: '',
        timestamp: new Date().toISOString()
      };
      
      // Try to identify each field
      cellTexts.forEach((text, index) => {
        if (symbolPattern.test(text)) {
          position.symbol = text.toUpperCase();
        } else if (pricePattern.test(text) && !position.entryPrice) {
          position.entryPrice = text.replace(/[$,]/g, '');
        } else if (pricePattern.test(text) && !position.markPrice && position.entryPrice) {
          position.markPrice = text.replace(/[$,]/g, '');
        } else if (pricePattern.test(text) && !position.liqPrice && position.markPrice) {
          position.liqPrice = text.replace(/[$,]/g, '');
        } else if (pnlPattern.test(text) && !position.unrealizedPnl) {
          position.unrealizedPnl = text.replace(/[$,]/g, '');
        } else if (percentPattern.test(text)) {
          position.unrealizedRoi = text;
        } else if (/^\d+\.?\d*$/.test(text) && !position.qty) {
          position.qty = text;
        }
      });
      
      // Fill in missing data with defaults
      if (!position.qty) position.qty = '1.0';
      if (!position.markPrice) position.markPrice = position.entryPrice;
      if (!position.liqPrice) position.liqPrice = '0';
      if (!position.unrealizedPnl) position.unrealizedPnl = '0';
      if (!position.unrealizedRoi) position.unrealizedRoi = '0%';
      position.positionPnl = position.unrealizedPnl;
      
      return position.symbol ? position : null;
      
    } catch (error) {
      console.error('❌ Error parsing position data:', error);
      return null;
    }
  }
  
  // Function to send positions to dashboard
  async function sendPositionsToDashboard(positions) {
    try {
      console.log(`📤 Sending ${positions.length} positions to dashboard...`);
      
      const response = await fetch(DASHBOARD_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(positions)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Successfully sent ${positions.length} positions to dashboard`);
      } else {
        console.error('❌ Failed to send positions:', result.error);
      }
      
    } catch (error) {
      console.error('❌ Network error sending positions:', error);
    }
  }

  // Function to send account data to dashboard
  async function sendAccountDataToDashboard(accountData) {
    try {
      console.log(`💰 Sending account data to dashboard...`);
      
      const response = await fetch('https://tigerhunt-pro-backend-k742.vercel.app/api/bydfi-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Successfully sent account data: Balance $${accountData.balance}, PnL $${accountData.pnl}`);
        console.log('🎯 Check your dashboard: https://tigerhunt-pro-frontend-ivory.vercel.app/dashboard');
      } else {
        console.error('❌ Failed to send account data:', result.error);
      }
      
    } catch (error) {
      console.error('❌ Network error sending account data:', error);
    }
  }
  
  // Main scraping function
  async function scrapeAndSend() {
    if (!isRunning) return;
    
    console.log('🔄 Starting BYDFI data extraction...');
    
    // Extract both positions and account data
    const positions = extractPositions();
    const accountData = extractAccountData();
    
    // Send both to dashboard
    await Promise.all([
      sendPositionsToDashboard(positions),
      accountData ? sendAccountDataToDashboard(accountData) : Promise.resolve()
    ]);
    
    console.log(`⏰ Next scan in ${SCRAPE_INTERVAL/1000} seconds...`);
  }
  
  // Control functions
  window.startBydfiScraper = function() {
    if (isRunning) {
      console.log('⚠️ Scraper is already running');
      return;
    }
    
    console.log('🚀 Starting BYDFI position scraper...');
    isRunning = true;
    
    // Run immediately
    scrapeAndSend();
    
    // Then run every interval
    intervalId = setInterval(scrapeAndSend, SCRAPE_INTERVAL);
    
    console.log(`✅ Scraper started! Running every ${SCRAPE_INTERVAL/1000} seconds`);
    console.log('💡 To stop: type stopBydfiScraper()');
  };
  
  window.stopBydfiScraper = function() {
    if (!isRunning) {
      console.log('⚠️ Scraper is not running');
      return;
    }
    
    console.log('🛑 Stopping BYDFI position scraper...');
    isRunning = false;
    
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    
    console.log('✅ Scraper stopped');
  };
  
  // Auto-start the scraper
  console.log('🎯 BYDFI Scraper loaded successfully!');
  console.log('📋 Commands:');
  console.log('  startBydfiScraper() - Start automatic scraping');
  console.log('  stopBydfiScraper()  - Stop automatic scraping');
  console.log('');
  console.log('🚀 Auto-starting scraper in 3 seconds...');
  
  setTimeout(() => {
    window.startBydfiScraper();
  }, 3000);
  
})(); 