'use client'

import React, { useState } from 'react'
import { signalApi } from '@/services/api'
import { CreateSignalRequest } from '@/types/signal'

interface SignalFormProps {
  onClose: () => void
  onSubmit: () => void
}

export default function SignalForm({ onClose, onSubmit }: SignalFormProps) {
  const [formData, setFormData] = useState<CreateSignalRequest>({
    action: 'BUY',
    symbol: '',
    price: 0,
    strategy: '',
    timeframe: '1h',
    notes: '',
    takeProfit1: undefined,
    takeProfit2: undefined,
    stopLoss: undefined,
    leverage: 1
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await signalApi.createSignal(formData)
      onSubmit()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create signal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CreateSignalRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ 
            color: '#ffffff', 
            fontSize: '1.25rem', 
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            margin: 0
          }}>
            CREATE SIGNAL
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888888',
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: '4px',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#ffffff'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#888888'}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Action */}
          <div>
            <label className="form-label">ACTION</label>
            <select
              value={formData.action}
              onChange={(e) => handleInputChange('action', e.target.value)}
              className="parasite-input"
              required
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
              <option value="HOLD">HOLD</option>
            </select>
          </div>

          {/* Symbol */}
          <div>
            <label className="form-label">SYMBOL</label>
            <select
              value={formData.symbol}
              onChange={(e) => handleInputChange('symbol', e.target.value)}
              className="parasite-input"
              required
              style={{ fontFamily: 'Consolas, monospace', letterSpacing: '1px' }}
            >
              <option value="">Select Symbol</option>
              <option value="BTCUSDT">BTCUSDT</option>
              <option value="ETHUSDT">ETHUSDT</option>
              <option value="BNBUSDT">BNBUSDT</option>
              <option value="ADAUSDT">ADAUSDT</option>
              <option value="SOLUSDT">SOLUSDT</option>
              <option value="XRPUSDT">XRPUSDT</option>
              <option value="DOGEUSDT">DOGEUSDT</option>
              <option value="AVAXUSDT">AVAXUSDT</option>
              <option value="AAVEUSDT">AAVEUSDT</option>
              <option value="DOTUSDT">DOTUSDT</option>
              <option value="LINKUSDT">LINKUSDT</option>
              <option value="MATICUSDT">MATICUSDT</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="form-label">PRICE</label>
            <input
              type="number"
              step="0.00000001"
              value={formData.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
              className="parasite-input"
              placeholder="0.00"
              required
              min="0"
              style={{ fontFamily: 'Consolas, monospace' }}
            />
          </div>

          {/* Strategy */}
          <div>
            <label className="form-label">
              STRATEGY <span style={{ color: '#666666', fontWeight: 'normal' }}>(optional)</span>
            </label>
            <input
              type="text"
              value={formData.strategy}
              onChange={(e) => handleInputChange('strategy', e.target.value)}
              className="parasite-input"
              placeholder="Tiger Hunt Pro Strategy"
            />
          </div>

          {/* Timeframe */}
          <div>
            <label className="form-label">TIMEFRAME</label>
            <select
              value={formData.timeframe}
              onChange={(e) => handleInputChange('timeframe', e.target.value)}
              className="parasite-input"
            >
              <option value="1m">1m</option>
              <option value="5m">5m</option>
              <option value="15m">15m</option>
              <option value="30m">30m</option>
              <option value="1h">1h</option>
              <option value="4h">4h</option>
              <option value="1d">1d</option>
              <option value="1w">1w</option>
            </select>
          </div>

          {/* Leverage */}
          <div>
            <label className="form-label">LEVERAGE</label>
            <select
              value={formData.leverage}
              onChange={(e) => handleInputChange('leverage', parseInt(e.target.value))}
              className="parasite-input"
            >
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={5}>5x</option>
              <option value={10}>10x</option>
              <option value={20}>20x</option>
              <option value={25}>25x</option>
              <option value={50}>50x</option>
              <option value={75}>75x</option>
              <option value={100}>100x</option>
              <option value={125}>125x</option>
            </select>
          </div>

          {/* Target Prices Section */}
          <div style={{ 
            borderTop: '1px solid rgba(255,255,255,0.1)', 
            paddingTop: '16px', 
            marginTop: '16px' 
          }}>
            <h4 style={{ 
              color: '#ffa500', 
              fontSize: '0.875rem', 
              fontWeight: '600',
              marginBottom: '12px' 
            }}>
              🎯 AUTO TARGET MONITORING
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Take Profit 1 */}
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>
                  TAKE PROFIT 1 <span style={{ color: '#666666', fontWeight: 'normal' }}>(optional)</span>
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  value={formData.takeProfit1 || ''}
                  onChange={(e) => handleInputChange('takeProfit1', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="parasite-input"
                  placeholder="0.00"
                  min="0"
                  style={{ fontFamily: 'Consolas, monospace', fontSize: '0.875rem' }}
                />
              </div>

              {/* Take Profit 2 */}
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>
                  TAKE PROFIT 2 <span style={{ color: '#666666', fontWeight: 'normal' }}>(optional)</span>
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  value={formData.takeProfit2 || ''}
                  onChange={(e) => handleInputChange('takeProfit2', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="parasite-input"
                  placeholder="0.00"
                  min="0"
                  style={{ fontFamily: 'Consolas, monospace', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            {/* Stop Loss */}
            <div style={{ marginTop: '12px' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>
                STOP LOSS <span style={{ color: '#666666', fontWeight: 'normal' }}>(optional)</span>
              </label>
              <input
                type="number"
                step="0.00000001"
                value={formData.stopLoss || ''}
                onChange={(e) => handleInputChange('stopLoss', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="parasite-input"
                placeholder="0.00"
                min="0"
                style={{ fontFamily: 'Consolas, monospace', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{
              marginTop: '12px',
              padding: '8px',
              backgroundColor: 'rgba(255,165,0,0.1)',
              border: '1px solid rgba(255,165,0,0.2)',
              borderRadius: '4px',
              fontSize: '0.75rem',
              color: '#ffa500'
            }}>
              💡 <strong>Auto-Monitoring:</strong> Targets will be monitored live via Binance API. 
              Signal will auto-remove and Discord notification will be sent when target is hit!
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="form-label">
              NOTES <span style={{ color: '#666666', fontWeight: 'normal' }}>(optional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="parasite-input"
              placeholder="Additional information about this signal..."
              style={{ 
                height: '80px', 
                resize: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              color: '#ffffff',
              fontSize: '0.875rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              padding: '12px',
              fontFamily: 'Consolas, monospace'
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-parasite"
              style={{ flex: 1 }}
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-parasite"
              style={{ 
                flex: 1,
                opacity: isSubmitting ? 0.5 : 1
              }}
            >
              {isSubmitting ? 'CREATING...' : 'CREATE SIGNAL'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 