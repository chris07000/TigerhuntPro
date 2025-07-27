// BYDFI Position Scraper for Tiger Hunt Pro Dashboard
// Copy and paste this script into your BYDFI browser console while on the positions page

(function() {
  console.log('🐅 Tiger Hunt Pro - BYDFI Position Scraper Started');
  console.log('📊 Dashboard URL: https://tigerhunt-pro-frontend-ivory.vercel.app/dashboard');
  
  // Configuration
  const DASHBOARD_API = 'https://tigerhunt-pro-backend-k742.vercel.app/api/bydfi-positions';
  const SCRAPE_INTERVAL = 10000; // 10 seconds
  const DEBUG_MODE = true; // Set to true for detailed logging
  
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
      
             // First, try to find the BYDFI positions table specifically
       let positionsTable = null;
       
       // Look for elements containing "Positions" text
       const allElements = document.querySelectorAll('*');
       for (const element of allElements) {
         const text = element.textContent || '';
         if (text.includes('Positions(') || text.includes('Position(') || 
             (text.includes('Positions') && text.length < 50)) {
           console.log('🎯 Found Positions section:', text);
           
           // Look for a table near this element
           let tableElement = element.querySelector('table');
           if (!tableElement) {
             // Check parent elements
             let parent = element.parentElement;
             for (let i = 0; i < 5 && parent; i++) {
               tableElement = parent.querySelector('table');
               if (tableElement) break;
               parent = parent.parentElement;
             }
           }
           if (!tableElement) {
             // Check sibling elements
             const siblings = element.parentElement?.children || [];
             for (const sibling of siblings) {
               tableElement = sibling.querySelector('table');
               if (tableElement) break;
             }
           }
           
           if (tableElement) {
             positionsTable = tableElement;
             console.log('✅ Found positions table near Positions section');
             break;
           }
         }
       }
       
       // Define selectors with positions table priority
       let possibleSelectors = [];
       
       if (positionsTable) {
         // If we found the positions table, search there first
         possibleSelectors = [
           positionsTable.querySelectorAll('tbody tr'),
           positionsTable.querySelectorAll('tr')
         ];
       } else {
         // Fallback to general selectors
         possibleSelectors = [
           'table tbody tr',                          // Standard table rows
           'table tr',                                // All table rows
           '.position-row',                           // Custom position rows
           '[data-testid*="position"]',               // Test ID attributes
           '.futures-position',                       // Futures specific
           '.position-item',                          // Position items
           'tr[role="row"]',                          // Table rows with role
           '[class*="position"]',                     // Any class containing position
           '[class*="Position"]',                     // Any class containing Position
           '[class*="table"] tr',                     // Table rows in any table class
           '[class*="Table"] tr',                     // Table rows in any Table class
           'div[role="row"]',                         // Div rows
           '.ant-table-tbody tr',                     // Ant Design table rows
           '.el-table__body tr',                      // Element UI table rows
           '*[class*="order"]',                       // Order related classes
           '*[class*="trade"]',                       // Trade related classes
           '*[class*="row"]',                         // Any row classes
           'tr',                                      // All table rows (last resort)
           'div[class*="cell"]',                      // Div cells
           'span[class*="cell"]'                      // Span cells
         ];
       }
      
             let foundPositions = false;
       
       for (let i = 0; i < possibleSelectors.length; i++) {
         const selector = possibleSelectors[i];
         let rows;
         
         if (positionsTable && i < 2) {
           // First two entries are NodeLists from the positions table
           rows = selector;
         } else {
           // String selectors
           rows = document.querySelectorAll(selector);
         }
         
         if (rows.length > 0) {
           const selectorName = positionsTable && i < 2 ? 'positions-table-rows' : selector;
           console.log(`📋 Found ${rows.length} potential position rows with selector: ${selectorName}`);
           
           if (DEBUG_MODE) {
             console.log(`🔍 DEBUG: Rows found:`, Array.from(rows).map(row => row.textContent?.trim()));
           }
           
                      rows.forEach((row, index) => {
             try {
               // Extract text content from all cells
               const cells = row.querySelectorAll('td, th, .cell, [class*="cell"], [class*="col"], span, div');
               
               if (cells.length >= 3) { // Lower minimum for BYDFI
                 const cellTexts = Array.from(cells).map(cell => 
                   cell.textContent?.trim() || ''
                 ).filter(text => text && text !== '--' && text !== '-' && text !== '');
                 
                 if (DEBUG_MODE && cellTexts.length > 0) {
                   console.log(`🔍 Row ${index}: [${cellTexts.join(' | ')}]`);
                 }
                 
                 // Check if this row contains trading symbols (BYDFI specific)
                 const hasSymbol = cellTexts.some(text => 
                   /^[A-Z]{3,}\/[A-Z]{3,}$/i.test(text) || // AAVE/USDT format
                   /^[A-Z]{3,}[A-Z]{3,}$/i.test(text) ||   // AAVEUSDT format  
                   /^[A-Z]{3,}-[A-Z]{3,}$/i.test(text)     // AAVE-USDT format
                 );
                 
                 const hasNumericData = cellTexts.some(text => 
                   /^\d+\.?\d*$/i.test(text) || // Numbers
                   /^[+-]?\d+\.?\d*\s*(USDT|USD)$/i.test(text) // PnL values
                 );
                 
                 if (hasSymbol && hasNumericData) {
                   console.log(`🎯 Found potential position row: [${cellTexts.join(' | ')}]`);
                   
                   // Try to extract position data using BYDFI-specific logic
                   const position = extractBydfiPosition(cellTexts);
                   
                   if (position && position.symbol) {
                     positions.push(position);
                     foundPositions = true;
                     console.log(`✅ BYDFI Position extracted: ${position.symbol} | ${position.qty} | PnL: ${position.unrealizedPnl}`);
                   }
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
         
         // Look for "No Data" or empty state first
         const noDataElements = document.querySelectorAll('*');
         let hasNoDataState = false;
         
         for (const element of noDataElements) {
           const text = element.textContent?.toLowerCase() || '';
           if (text.includes('no data') || text.includes('no position') || text.includes('empty') || 
               text.includes('no active positions') || text.includes('no open positions')) {
             console.log('📭 No positions found (empty state detected)');
             hasNoDataState = true;
             break;
           }
         }
         
         if (!hasNoDataState) {
           // More aggressive search for position data
           console.log('🔍 Scanning entire page for trading data...');
           
           const allElements = document.querySelectorAll('*');
           const potentialPositions = [];
           
           allElements.forEach(element => {
             const text = element.textContent?.trim() || '';
             const innerHTML = element.innerHTML || '';
             
             // Look for cryptocurrency symbols
             if (/^[A-Z]{3,}(USDT|USD|BTC|ETH)$/i.test(text)) {
               console.log('🔍 Found potential symbol:', text);
               
               // Try to find surrounding data (parent/sibling elements)
               const parent = element.parentElement;
               const siblings = parent ? Array.from(parent.children) : [];
               
               const potentialData = [];
               siblings.forEach(sibling => {
                 const siblingText = sibling.textContent?.trim() || '';
                 if (siblingText && siblingText !== text) {
                   potentialData.push(siblingText);
                 }
               });
               
               if (potentialData.length > 3) { // If we have enough data around the symbol
                 console.log('🎯 Found position data around symbol:', text, potentialData);
                 
                 // Try to create a position from this data
                 const position = extractPositionFromArray([text, ...potentialData]);
                 if (position && position.symbol) {
                   potentialPositions.push(position);
                   foundPositions = true;
                 }
               }
             }
             
             // Look for Long/Short indicators
             if (/^(Long|Short)\s+[A-Z]{3,}/i.test(text)) {
               console.log('🔍 Found Long/Short position:', text);
               // Extract position data from this context
             }
             
             // Look for PnL patterns that might indicate positions
             if (/[+-]\$?\d+\.\d{2}/.test(text) && !text.includes('Total') && !text.includes('Balance')) {
               console.log('🔍 Found potential position PnL:', text);
               // Try to find associated symbol
             }
           });
           
           if (potentialPositions.length > 0) {
             console.log(`✅ Found ${potentialPositions.length} positions using alternative method`);
             positions.push(...potentialPositions);
           } else {
             console.log('❌ No positions detected anywhere on page');
           }
         }
       }
      
             // Summary of position extraction
       console.log('📋 Position extraction summary:');
       console.log(`🎯 Total positions found: ${positions.length}`);
       if (positions.length > 0) {
         positions.forEach((pos, index) => {
           console.log(`📊 Position ${index + 1}: ${pos.symbol} | ${pos.qty} | Entry: $${pos.entryPrice} | PnL: $${pos.unrealizedPnl}`);
         });
       } else {
         console.log('❌ No trading positions detected on this page');
         console.log('💡 Make sure you are on the BYDFI Positions/Trading page');
         console.log('💡 Try opening a position first to test the scraper');
       }
       
       return positions;
      
    } catch (error) {
      console.error('❌ Error extracting positions:', error);
      return [];
    }
  }
  
  // Function to parse position data from array of texts
  function extractPositionFromArray(dataArray) {
    try {
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
      
      // Common patterns for different data
      const symbolPattern = /^[A-Z]{3,}(USDT|USD|BTC|ETH)$/i;
      const pricePattern = /^\$?[\d,]+\.?\d*$/;
      const pnlPattern = /^[+-]?\$?[\d,]+\.?\d*$/;
      const percentPattern = /^[+-]?\d+\.?\d*%$/;
      const qtyPattern = /^\d+\.?\d*$/;
      
      dataArray.forEach((text) => {
        if (symbolPattern.test(text)) {
          position.symbol = text.toUpperCase();
        } else if (qtyPattern.test(text) && !position.qty && parseFloat(text) > 0) {
          position.qty = text;
        } else if (pricePattern.test(text) && !position.entryPrice) {
          position.entryPrice = text.replace(/[$,]/g, '');
        } else if (pricePattern.test(text) && !position.markPrice && position.entryPrice) {
          position.markPrice = text.replace(/[$,]/g, '');
        } else if (pnlPattern.test(text) && !position.unrealizedPnl) {
          position.unrealizedPnl = text.replace(/[$,]/g, '');
        } else if (percentPattern.test(text)) {
          position.unrealizedRoi = text;
        }
      });
      
      // Fill defaults
      if (!position.qty) position.qty = '1.0';
      if (!position.markPrice) position.markPrice = position.entryPrice;
      if (!position.liqPrice) position.liqPrice = '0';
      if (!position.unrealizedPnl) position.unrealizedPnl = '0';
      if (!position.unrealizedRoi) position.unrealizedRoi = '0%';
      position.positionPnl = position.unrealizedPnl;
      
      return position.symbol ? position : null;
      
    } catch (error) {
      console.error('❌ Error parsing position array:', error);
      return null;
    }
  }

  // Function to extract BYDFI-specific position data
  function extractBydfiPosition(cellTexts) {
    try {
      console.log('🔍 BYDFI Position extraction from:', cellTexts);
      
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
      
      // BYDFI-specific patterns
      const symbolPattern = /^([A-Z]{3,})\/([A-Z]{3,})$/i; // AAVE/USDT
      const symbolPattern2 = /^([A-Z]{3,})([A-Z]{3,})$/i;   // AAVEUSDT
      const qtyPattern = /^[\d,]+\.?\d*\s*[A-Z]{3,}$/i;     // 13.18 AAVE
      const pricePattern = /^[\d,]+\.?\d*$/;                // 298.01
      const pnlPattern = /^[+-]?[\d,]+\.?\d*\s*(USDT|USD)$/i; // -2.36 USDT
      const percentPattern = /^[+-]?\d+\.?\d*%$/;           // Percentage
      
      cellTexts.forEach((text, index) => {
        console.log(`  Cell ${index}: "${text}"`);
        
        // Extract symbol (AAVE/USDT format)
        if (symbolPattern.test(text)) {
          const match = text.match(symbolPattern);
          position.symbol = `${match[1]}${match[2]}`.toUpperCase(); // Convert to AAVEUSDT
          console.log(`    ✅ Found symbol: ${position.symbol}`);
        }
        // Extract symbol (AAVEUSDT format) 
        else if (symbolPattern2.test(text) && text.length >= 6) {
          position.symbol = text.toUpperCase();
          console.log(`    ✅ Found symbol: ${position.symbol}`);
        }
        // Extract quantity (13.18 AAVE)
        else if (qtyPattern.test(text)) {
          const qtyMatch = text.match(/^([\d,]+\.?\d*)/);
          if (qtyMatch) {
            position.qty = qtyMatch[1];
            console.log(`    ✅ Found quantity: ${position.qty}`);
          }
        }
        // Extract prices (entry, mark, liq)
        else if (pricePattern.test(text) && parseFloat(text.replace(/,/g, '')) > 0) {
          const price = text.replace(/,/g, '');
          if (!position.entryPrice) {
            position.entryPrice = price;
            console.log(`    ✅ Found entry price: ${position.entryPrice}`);
          } else if (!position.markPrice) {
            position.markPrice = price;
            console.log(`    ✅ Found mark price: ${position.markPrice}`);
          } else if (!position.liqPrice) {
            position.liqPrice = price;
            console.log(`    ✅ Found liq price: ${position.liqPrice}`);
          }
        }
        // Extract PnL (-2.36 USDT)
        else if (pnlPattern.test(text)) {
          const pnlMatch = text.match(/^([+-]?[\d,]+\.?\d*)/);
          if (pnlMatch) {
            position.unrealizedPnl = pnlMatch[1];
            console.log(`    ✅ Found PnL: ${position.unrealizedPnl}`);
          }
        }
        // Extract percentage
        else if (percentPattern.test(text)) {
          position.unrealizedRoi = text;
          console.log(`    ✅ Found ROI: ${position.unrealizedRoi}`);
        }
      });
      
      // Fill in defaults
      if (!position.qty) position.qty = '1.0';
      if (!position.markPrice) position.markPrice = position.entryPrice;
      if (!position.liqPrice) position.liqPrice = '0';
      if (!position.unrealizedPnl) position.unrealizedPnl = '0';
      if (!position.unrealizedRoi) position.unrealizedRoi = '0%';
      position.positionPnl = position.unrealizedPnl;
      
      console.log('📊 Final position:', position);
      
      return position.symbol ? position : null;
      
    } catch (error) {
      console.error('❌ Error parsing BYDFI position:', error);
      return null;
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
      
      // Add timestamp for tracking
      const timestamp = new Date().toLocaleTimeString();
      
      const response = await fetch(DASHBOARD_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(positions)
      });
      
      const result = await response.json();
      
      if (result.success) {
        if (result.isPreservedData) {
          console.log(`✅ [${timestamp}] Dashboard kept last good positions (${positions.length}) - scraper sent empty data`);
        } else {
          console.log(`✅ [${timestamp}] Successfully sent ${positions.length} positions to dashboard`);
        }
      } else {
        console.error(`❌ [${timestamp}] Failed to send positions:`, result.error);
      }
      
    } catch (error) {
      console.error(`❌ [${timestamp}] Network error sending positions:`, error);
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
  
  // Function to check current scraper status
  window.checkScraperStatus = function() {
    console.log('📊 BYDFI SCRAPER STATUS CHECK');
    console.log('==================================');
    console.log(`⏰ Scraper running: ${isRunning}`);
    console.log(`🔄 Interval ID: ${intervalId}`);
    console.log(`📍 Current URL: ${window.location.href}`);
    console.log(`🏷️ Page title: ${document.title}`);
    
    // Quick position check
    const positions = extractPositions();
    console.log(`🎯 Positions found: ${positions.length}`);
    if (positions.length > 0) {
      positions.forEach(pos => console.log(`  - ${pos.symbol}: ${pos.qty} (PnL: ${pos.unrealizedPnl})`));
    }
    
    // Quick account check
    const account = extractAccountData();
    console.log(`💰 Account balance: ${account?.balance || 'Not found'} USDT`);
    console.log(`📊 Account PnL: ${account?.pnl || 'Not found'} USDT`);
    
    console.log('==================================');
    
    if (!isRunning) {
      console.log('💡 To start scraper: startBydfiScraper()');
    } else {
      console.log('💡 To stop scraper: stopBydfiScraper()');
    }
  };

  // Debug function to analyze page structure
  window.debugBydfiPage = function() {
    console.log('🔍 DEBUG: Analyzing BYDFI page structure...');
    
    // Find all tables
    const tables = document.querySelectorAll('table');
    console.log(`📊 Found ${tables.length} tables on page`);
    
    tables.forEach((table, index) => {
      console.log(`Table ${index + 1}:`);
      const rows = table.querySelectorAll('tr');
      console.log(`  - ${rows.length} rows`);
      rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('td, th');
        if (cells.length > 0) {
          const cellTexts = Array.from(cells).map(cell => cell.textContent?.trim()).filter(text => text);
          if (cellTexts.length > 0) {
            console.log(`    Row ${rowIndex + 1}: [${cellTexts.join(' | ')}]`);
          }
        }
      });
    });
    
    // Find elements containing crypto symbols
    console.log('🔍 Looking for crypto symbols...');
    const allElements = document.querySelectorAll('*');
    const cryptoSymbols = [];
    
    allElements.forEach(element => {
      const text = element.textContent?.trim() || '';
      if (/^[A-Z]{3,}(USDT|USD|BTC|ETH)$/i.test(text)) {
        cryptoSymbols.push({
          symbol: text,
          element: element,
          parent: element.parentElement?.textContent?.trim(),
          siblings: Array.from(element.parentElement?.children || []).map(el => el.textContent?.trim()).filter(t => t)
        });
      }
    });
    
    console.log(`🎯 Found ${cryptoSymbols.length} potential crypto symbols:`, cryptoSymbols);
    
    // Look for trading-related text
    console.log('🔍 Looking for trading-related elements...');
    const tradingElements = [];
    
    allElements.forEach(element => {
      const text = element.textContent?.toLowerCase() || '';
      if (text.includes('position') || text.includes('long') || text.includes('short') || 
          text.includes('entry') || text.includes('profit') || text.includes('loss')) {
        tradingElements.push({
          text: element.textContent?.trim(),
          className: element.className,
          tag: element.tagName
        });
      }
    });
    
    console.log(`📊 Found ${tradingElements.length} trading-related elements:`, tradingElements);
  };
  
  // Auto-start the scraper
  console.log('🎯 BYDFI Scraper loaded successfully!');
  console.log('📋 Commands:');
  console.log('  startBydfiScraper() - Start automatic scraping');
  console.log('  stopBydfiScraper()  - Stop automatic scraping');
  console.log('  checkScraperStatus() - Check current status & data');
  console.log('  debugBydfiPage()    - Debug page structure');
  console.log('');
  console.log('💡 If positions disappear, try: checkScraperStatus()');
  console.log('💡 If positions not detected, try: debugBydfiPage()');
  console.log('🚀 Auto-starting scraper in 3 seconds...');
  
  setTimeout(() => {
    window.startBydfiScraper();
  }, 3000);
  
})(); 