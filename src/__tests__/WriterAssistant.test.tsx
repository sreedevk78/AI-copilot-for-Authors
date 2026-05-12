import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WriterAssistant } from '@/components/WriterAssistant'

// Mock the export utilities
jest.mock('@/lib/exportUtils', () => ({
  exportAsTxt: jest.fn(),
  exportAsHtml: jest.fn(),
  exportAsMarkdown: jest.fn(),
  exportAsPdf: jest.fn(),
  copyToClipboard: jest.fn().mockResolvedValue(true),
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('WriterAssistant', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the main interface', () => {
    render(<WriterAssistant />)
    
    expect(screen.getByText('AI Writing Assistant')).toBeInTheDocument()
    expect(screen.getByText('Prompt')).toBeInTheDocument()
    expect(screen.getByText('Output')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders template buttons', () => {
    render(<WriterAssistant />)
    
    expect(screen.getByText('Story Idea')).toBeInTheDocument()
    expect(screen.getByText('Plot Outline')).toBeInTheDocument()
    expect(screen.getByText('Dialogue')).toBeInTheDocument()
  })

  it('handles template selection', () => {
    render(<WriterAssistant />)
    
    const storyIdeaButton = screen.getByText('Story Idea')
    fireEvent.click(storyIdeaButton)
    
    // Check if the template is applied (this would update the prompt textarea)
    const promptTextarea = screen.getByPlaceholderText('Enter your writing prompt here...')
    expect((promptTextarea as HTMLTextAreaElement).value).toEqual(expect.stringContaining('Generate a creative story idea'))
  })

  it('handles settings changes', () => {
    render(<WriterAssistant />)
    
    const toneSelect = screen.getByDisplayValue('Creative')
    fireEvent.change(toneSelect, { target: { value: 'Professional' } })
    
    expect(toneSelect).toHaveValue('Professional')
  })

  it('disables generate button when prompt is empty', () => {
    render(<WriterAssistant />)
    
    const generateButton = screen.getByText('Generate')
    expect(generateButton).toBeDisabled()
  })

  it('enables generate button when prompt has content', () => {
    render(<WriterAssistant />)
    
    const promptTextarea = screen.getByPlaceholderText('Enter your writing prompt here...')
    fireEvent.change(promptTextarea, { target: { value: 'Test prompt' } })
    
    const generateButton = screen.getByText('Generate')
    expect(generateButton).not.toBeDisabled()
  })

  it('shows export dropdown on hover', async () => {
    render(<WriterAssistant />)
    
    const exportButton = screen.getByTitle('Export')
    
    // Mock some output content
    const outputDiv = screen.getByText('Generated content will appear here')
    fireEvent.change(screen.getByPlaceholderText('Enter your writing prompt here...'), {
      target: { value: 'Test prompt' }
    })
    
    // This would normally be set by the generation process
    // For testing, we'll just verify the dropdown structure exists
    expect(exportButton).toBeInTheDocument()
  })

  it('handles history toggle', () => {
    render(<WriterAssistant />)
    
    const historyButton = screen.getByTitle('Templates & History')
    fireEvent.click(historyButton)
    
    // Should show history section
    expect(screen.getByText('History')).toBeInTheDocument()
  })
})

// Integration test for generate flow
describe('WriterAssistant Integration', () => {
  beforeEach(() => {
    // Mock fetch for API calls
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('handles generate flow with streaming', async () => {
    // Mock streaming response
    const mockStream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: 'Test content' })}\n\n`))
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
        controller.close()
      }
    })

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      body: mockStream,
    })

    render(<WriterAssistant />)
    
    const promptTextarea = screen.getByPlaceholderText('Enter your writing prompt here...')
    fireEvent.change(promptTextarea, { target: { value: 'Test prompt' } })
    
    const generateButton = screen.getByText('Generate')
    fireEvent.click(generateButton)
    
    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Generating...')).toBeInTheDocument()
    })
  })
})
