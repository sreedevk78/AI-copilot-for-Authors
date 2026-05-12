'use client'

interface VerificationResult {
  feature: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

export class BackendVerificationService {
  private static instance: BackendVerificationService

  static getInstance(): BackendVerificationService {
    if (!BackendVerificationService.instance) {
      BackendVerificationService.instance = new BackendVerificationService()
    }
    return BackendVerificationService.instance
  }

  async verifyAllBackendSaves(): Promise<VerificationResult[]> {
    const results: VerificationResult[] = []

    // Verify user onboarding data
    results.push(await this.verifyUserOnboarding())
    
    // Verify story creation
    results.push(await this.verifyStoryCreation())
    
    // Verify story ideas
    results.push(await this.verifyStoryIdeas())
    
    // Verify characters
    results.push(await this.verifyCharacters())
    
    // Verify plots
    results.push(await this.verifyPlots())
    
    // Verify dialogues
    results.push(await this.verifyDialogues())
    
    // Verify worlds
    results.push(await this.verifyWorlds())
    
    // Verify AI suggestions
    results.push(await this.verifyAISuggestions())
    
    // Verify voice profiles
    results.push(await this.verifyVoiceProfiles())
    
    // Verify chat sessions
    results.push(await this.verifyChatSessions())

    return results
  }

  private async verifyUserOnboarding(): Promise<VerificationResult> {
    try {
      const response = await fetch('/api/user/onboarding-status')
      if (response.ok) {
        const data = await response.json()
        return {
          feature: 'User Onboarding',
          status: 'success',
          message: 'Onboarding data loads successfully',
          details: data
        }
      } else {
        return {
          feature: 'User Onboarding',
          status: 'error',
          message: 'Failed to load onboarding data',
          details: await response.text()
        }
      }
    } catch (error) {
      return {
        feature: 'User Onboarding',
        status: 'error',
        message: 'Error verifying onboarding data',
        details: error
      }
    }
  }

  private async verifyStoryCreation(): Promise<VerificationResult> {
    try {
      const testStory = {
        title: 'Test Story for Verification',
        description: 'This is a test story to verify backend saving',
        genre: 'Fantasy',
        tags: ['test', 'verification']
      }

      const response = await fetch('/api/stories/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testStory)
      })

      if (response.ok) {
        const data = await response.json()
        return {
          feature: 'Story Creation',
          status: 'success',
          message: 'Story creation and saving works',
          details: data
        }
      } else {
        return {
          feature: 'Story Creation',
          status: 'error',
          message: 'Failed to create story',
          details: await response.text()
        }
      }
    } catch (error) {
      return {
        feature: 'Story Creation',
        status: 'error',
        message: 'Error verifying story creation',
        details: error
      }
    }
  }

  private async verifyStoryIdeas(): Promise<VerificationResult> {
    try {
      const response = await fetch('/api/content/story-ideas')
      if (response.ok) {
        const data = await response.json()
        return {
          feature: 'Story Ideas',
          status: 'success',
          message: 'Story ideas API works',
          details: data
        }
      } else {
        return {
          feature: 'Story Ideas',
          status: 'error',
          message: 'Failed to load story ideas',
          details: await response.text()
        }
      }
    } catch (error) {
      return {
        feature: 'Story Ideas',
        status: 'error',
        message: 'Error verifying story ideas',
        details: error
      }
    }
  }

  private async verifyCharacters(): Promise<VerificationResult> {
    try {
      const response = await fetch('/api/content/characters')
      if (response.ok) {
        const data = await response.json()
        return {
          feature: 'Characters',
          status: 'success',
          message: 'Characters API works',
          details: data
        }
      } else {
        return {
          feature: 'Characters',
          status: 'error',
          message: 'Failed to load characters',
          details: await response.text()
        }
      }
    } catch (error) {
      return {
        feature: 'Characters',
        status: 'error',
        message: 'Error verifying characters',
        details: error
      }
    }
  }

  private async verifyPlots(): Promise<VerificationResult> {
    try {
      const response = await fetch('/api/content/plots')
      if (response.ok) {
        const data = await response.json()
        return {
          feature: 'Plots',
          status: 'success',
          message: 'Plots API works',
          details: data
        }
      } else {
        return {
          feature: 'Plots',
          status: 'error',
          message: 'Failed to load plots',
          details: await response.text()
        }
      }
    } catch (error) {
      return {
        feature: 'Plots',
        status: 'error',
        message: 'Error verifying plots',
        details: error
      }
    }
  }

  private async verifyDialogues(): Promise<VerificationResult> {
    try {
      const response = await fetch('/api/content/dialogues')
      if (response.ok) {
        const data = await response.json()
        return {
          feature: 'Dialogues',
          status: 'success',
          message: 'Dialogues API works',
          details: data
        }
      } else {
        return {
          feature: 'Dialogues',
          status: 'error',
          message: 'Failed to load dialogues',
          details: await response.text()
        }
      }
    } catch (error) {
      return {
        feature: 'Dialogues',
        status: 'error',
        message: 'Error verifying dialogues',
        details: error
      }
    }
  }

  private async verifyWorlds(): Promise<VerificationResult> {
    try {
      const response = await fetch('/api/content/worlds')
      if (response.ok) {
        const data = await response.json()
        return {
          feature: 'Worlds',
          status: 'success',
          message: 'Worlds API works',
          details: data
        }
      } else {
        return {
          feature: 'Worlds',
          status: 'error',
          message: 'Failed to load worlds',
          details: await response.text()
        }
      }
    } catch (error) {
      return {
        feature: 'Worlds',
        status: 'error',
        message: 'Error verifying worlds',
        details: error
      }
    }
  }

  private async verifyAISuggestions(): Promise<VerificationResult> {
    try {
      const response = await fetch('/api/ai-suggestions')
      if (response.ok) {
        const data = await response.json()
        return {
          feature: 'AI Suggestions',
          status: 'success',
          message: 'AI Suggestions API works',
          details: data
        }
      } else {
        return {
          feature: 'AI Suggestions',
          status: 'error',
          message: 'Failed to load AI suggestions',
          details: await response.text()
        }
      }
    } catch (error) {
      return {
        feature: 'AI Suggestions',
        status: 'error',
        message: 'Error verifying AI suggestions',
        details: error
      }
    }
  }

  private async verifyVoiceProfiles(): Promise<VerificationResult> {
    try {
      const response = await fetch('/api/content/voice-profiles')
      if (response.ok) {
        const data = await response.json()
        return {
          feature: 'Voice Profiles',
          status: 'success',
          message: 'Voice Profiles API works',
          details: data
        }
      } else {
        return {
          feature: 'Voice Profiles',
          status: 'error',
          message: 'Failed to load voice profiles',
          details: await response.text()
        }
      }
    } catch (error) {
      return {
        feature: 'Voice Profiles',
        status: 'error',
        message: 'Error verifying voice profiles',
        details: error
      }
    }
  }

  private async verifyChatSessions(): Promise<VerificationResult> {
    try {
      const response = await fetch('/api/content/chat-sessions')
      if (response.ok) {
        const data = await response.json()
        return {
          feature: 'Chat Sessions',
          status: 'success',
          message: 'Chat Sessions API works',
          details: data
        }
      } else {
        return {
          feature: 'Chat Sessions',
          status: 'error',
          message: 'Failed to load chat sessions',
          details: await response.text()
        }
      }
    } catch (error) {
      return {
        feature: 'Chat Sessions',
        status: 'error',
        message: 'Error verifying chat sessions',
        details: error
      }
    }
  }

  async testDataPersistence(): Promise<VerificationResult[]> {
    const results: VerificationResult[] = []

    // Test creating and retrieving data
    try {
      // Test story idea creation
      const storyIdeaResponse = await fetch('/api/content/story-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Story Idea',
          concept: 'A test concept for verification',
          genre: 'Fantasy',
          themes: ['adventure', 'magic'],
          characters: ['hero', 'villain'],
          conflict: 'Test conflict',
          setting: 'Test setting',
          potential: 'high'
        })
      })

      if (storyIdeaResponse.ok) {
        results.push({
          feature: 'Story Idea Persistence',
          status: 'success',
          message: 'Story idea created and saved successfully'
        })
      } else {
        results.push({
          feature: 'Story Idea Persistence',
          status: 'error',
          message: 'Failed to create story idea'
        })
      }
    } catch (error) {
      results.push({
        feature: 'Story Idea Persistence',
        status: 'error',
        message: 'Error testing story idea persistence',
        details: error
      })
    }

    return results
  }
}

export const backendVerification = BackendVerificationService.getInstance()
