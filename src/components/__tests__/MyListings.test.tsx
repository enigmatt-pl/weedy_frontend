import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MyListings } from '../MyListings';
import { DispensariesApi } from '../../lib/api';
import { BrowserRouter } from 'react-router-dom';

// Mock the API
vi.mock('../../lib/api', () => ({
  DispensariesApi: {
    getAll: vi.fn(),
    publish: vi.fn(),
    unpublish: vi.fn(),
    destroy: vi.fn(),
    update: vi.fn(),
  },
}));

// Mock the toast store
vi.mock('../../store/toastStore', () => ({
  useToastStore: () => ({
    showToast: vi.fn(),
  }),
}));

const mockDispensaries = [
  {
    id: '1',
    title: 'Draft Listing',
    status: 'draft',
    created_at: new Date().toISOString(),
    query_data: 'Warszawa',
  },
  {
    id: '2',
    title: 'Published Listing',
    status: 'published',
    created_at: new Date().toISOString(),
    query_data: 'Kraków',
  },
];

describe('MyListings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (DispensariesApi.getAll as any).mockResolvedValue({
      dispensaries: mockDispensaries,
      meta: { total_pages: 1, current_page: 1 },
    });
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <MyListings />
      </BrowserRouter>
    );

  it('renders the list of dispensaries', async () => {
    renderComponent();
    expect(await screen.findByText('Draft Listing')).toBeInTheDocument();
    expect(screen.getByText('Published Listing')).toBeInTheDocument();
  });

  it('toggles between Publish and Unpublish buttons based on status', async () => {
    renderComponent();
    
    // Click on the draft listing to open editor
    const draftCard = await screen.findByText('Draft Listing');
    fireEvent.click(draftCard);
    
    expect(screen.getByText('Publikuj')).toBeInTheDocument();
    
    // Go back and click on the published listing
    fireEvent.click(screen.getByText('← Wróć do listy'));
    const publishedCard = await screen.findByText('Published Listing');
    fireEvent.click(publishedCard);
    
    expect(screen.getByText('Wycofaj z Sieci')).toBeInTheDocument();
  });

  it('calls publish API when Publish button is clicked', async () => {
    renderComponent();
    const draftCard = await screen.findByText('Draft Listing');
    fireEvent.click(draftCard);
    
    const publishButton = screen.getByText('Publikuj');
    fireEvent.click(publishButton);
    
    await waitFor(() => {
      expect(DispensariesApi.publish).toHaveBeenCalledWith('1');
    });
  });

  it('calls unpublish API when Unpublish button is clicked', async () => {
    renderComponent();
    const publishedCard = await screen.findByText('Published Listing');
    fireEvent.click(publishedCard);
    
    const unpublishButton = screen.getByText('Wycofaj z Sieci');
    fireEvent.click(unpublishButton);
    
    await waitFor(() => {
      expect(DispensariesApi.unpublish).toHaveBeenCalledWith('2');
    });
  });
});
