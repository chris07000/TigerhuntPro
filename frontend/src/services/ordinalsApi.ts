import axios from 'axios'

interface Inscription {
  id: string
  number?: number
  address?: string
  output_value?: number
  content_type?: string
  content_length?: number
  timestamp?: number
  genesis_height?: number
  genesis_fee?: number
  genesis_transaction?: string
  location?: string
  output?: string
  offset?: number
  sat_ordinal?: number
  sat_rarity?: string
  sat_coinbase_height?: number
  preview?: string
  content?: string
  delegate?: string
  metaprotocol?: string
  parent?: string
  pointer?: number
  value?: number
}

/**
 * Bitcoin Tiger Ordinals verificatie service
 * Controleert of een wallet adres Bitcoin Tiger inscriptions bezit
 */
class OrdinalsService {
  // Bitcoin Tiger collection identifiers
  private tigerCollectionIds = new Set<string>([
    // INDIVIDUELE INSCRIPTION IDs (als je die hebt)
  ])
  
  // Bitcoin Tiger parent inscription ID - veel efficiënter!
  private tigerParentId: string | null = null
  
  // Collection number range (alternatief)
  private tigerNumberRange: { min: number; max: number } | null = null

  /**
   * Check of een wallet address Bitcoin Tiger ordinals bevat
   */
  async verifyTigerOwnership(address: string): Promise<{
    hasValidTiger: boolean
    tigerOrdinals: Inscription[]
    totalInscriptions: number
    error?: string
  }> {
    try {
      // Check Tiger ownership with configured IDs
      const allInscriptions = await this.fetchAllInscriptions(address)
      const tigerOrdinals = this.identifyTigerInscriptions(allInscriptions)
      
      if (tigerOrdinals.length > 0) {
        console.log('✅ Bitcoin Tiger ownership verified!')
      }
      
      return {
        hasValidTiger: tigerOrdinals.length > 0,
        tigerOrdinals,
        totalInscriptions: allInscriptions.length
      }
      
    } catch (error: any) {
      console.error('❌ Error verifying Tiger ownership:', error)
      return {
        hasValidTiger: false,
        tigerOrdinals: [],
        totalInscriptions: 0,
        error: error.message
      }
    }
  }

  /**
   * Fetch alle inscriptions voor een address
   */
  private async fetchAllInscriptions(address: string): Promise<Inscription[]> {
    try {
      // Fetch from Hiro API
      const response = await axios.get(`https://api.hiro.so/ordinals/v1/inscriptions`, {
        params: { address, limit: 60, offset: 0 },
        timeout: 10000
      })
      
      if (response.data?.results) {
        return response.data.results.map((item: any) => ({
          id: item.id,
          number: item.number,
          address: item.address,
          content_type: item.content_type,
          genesis_height: item.genesis_height,
          timestamp: item.timestamp,
          content: item.content_uri,
          preview: item.preview_uri
        }))
      }
      
      return []
      
    } catch (error: any) {
      // Fallback to OrdAPI
      try {
        const response = await axios.get(`https://ordapi.xyz/address/${address}/inscriptions`, {
          timeout: 8000
        })
        
        if (response.data && Array.isArray(response.data)) {
          return response.data.map((item: any) => ({
            id: item.id || item.inscription_id,
            number: item.inscription_number || item.number,
            address: address,
            content_type: item.content_type,
            content: item.content_uri || item.content,
            preview: item.preview || item.thumbnail
          }))
        }
      } catch (fallbackError) {
        // Silent fallback failure
      }
      
      return []
    }
  }

  /**
   * Identificeer Bitcoin Tiger inscriptions gebaseerd op content/metadata
   */
  private identifyTigerInscriptions(inscriptions: Inscription[]): Inscription[] {
    return inscriptions.filter(inscription => {
      // Check exact Tiger ID match (primary method)
      if (this.tigerCollectionIds.has(inscription.id)) {
        return true
      }
      
      // Check parent inscription ID
      if (this.tigerParentId && inscription.parent === this.tigerParentId) {
        return true
      }
      
      // Check inscription number ranges
      if (this.tigerNumberRange && inscription.number) {
        const { min, max } = this.tigerNumberRange
        if (inscription.number >= min && inscription.number <= max) {
          return true
        }
      }
      
      // Check content for Tiger keywords (fallback)
      const content = inscription.content?.toLowerCase() || ''
      const preview = inscription.preview?.toLowerCase() || ''
      const tigerKeywords = ['tiger', 'tigerhunt', 'tiger hunt', 'tiger collective']
      
      return tigerKeywords.some(keyword => 
        content.includes(keyword) || preview.includes(keyword)
      )
    })
  }

  /**
   * Check if specific inscription IDs are owned by address
   * Dit wordt gebruikt zodra we de echte Tiger inscription IDs hebben
   */
  private async checkSpecificInscriptions(address: string, inscriptionIds: string[]): Promise<Inscription[]> {
    const foundTigers: Inscription[] = []
    
    for (const inscriptionId of inscriptionIds) {
      try {
        // Check met Hiro API voor specifieke inscription
        const response = await axios.get(`https://api.hiro.so/ordinals/v1/inscriptions/${inscriptionId}`, {
          timeout: 5000
        })
        
        if (response.data && response.data.address === address) {
          foundTigers.push({
            id: inscriptionId,
            number: response.data.number,
            address: response.data.address,
            content_type: response.data.content_type,
            genesis_height: response.data.genesis_height,
            timestamp: response.data.timestamp
          })
        }
        
      } catch (error) {
        console.log(`📡 Could not verify inscription ${inscriptionId}:`, error)
        // Continue met volgende inscription
      }
    }
    
    return foundTigers
  }

  /**
   * Get readable information about Tiger ordinals
   */
  getTigerInfo(tigerOrdinals: Inscription[]): string {
    if (tigerOrdinals.length === 0) return 'No Bitcoin Tiger ordinals found'
    
    const info = tigerOrdinals.map(tiger => 
      `#${tiger.number || 'Unknown'} (${tiger.id.substring(0, 8)}...)`
    ).join(', ')
    
    return `Bitcoin Tiger${tigerOrdinals.length > 1 ? 's' : ''}: ${info}`
  }

  /**
   * Set Bitcoin Tiger parent inscription ID
   */
  setTigerParentId(parentId: string) {
    this.tigerParentId = parentId
  }

  /**
   * Set Bitcoin Tiger inscription number range
   */
  setTigerNumberRange(min: number, max: number) {
    this.tigerNumberRange = { min, max }
  }

  /**
   * Update Tiger collection IDs
   */
  updateTigerCollectionIds(newIds: string[]) {
    this.tigerCollectionIds = new Set(newIds)
  }

  /**
   * Reset all Tiger identification criteria
   */
  resetTigerConfiguration() {
    this.tigerParentId = null
    this.tigerNumberRange = null
    this.tigerCollectionIds.clear()
  }




}

export const ordinalsService = new OrdinalsService()

// VOORBEELDEN VOOR CONFIGURATIE:
//
// Optie 1: Parent inscription ID (AANBEVOLEN - meest efficiënt)
// ordinalsService.setTigerParentId('abc123def456...i0')
//
// Optie 2: Inscription number range  
// ordinalsService.setTigerNumberRange(50000, 60000)
//
// Optie 3: Individuele inscription IDs (minder efficiënt)
// ordinalsService.updateTigerCollectionIds(['id1...i0', 'id2...i0', 'id3...i0'])

export type { Inscription } 