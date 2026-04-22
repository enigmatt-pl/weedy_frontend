import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../Login';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';

// Mock the stores
vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('../../store/toastStore', () => ({
  useToastStore: vi.fn(),
}));

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  const signInMock = vi.fn();
  const showToastMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as unknown as Mock).mockReturnValue({
      signIn: signInMock,
    });
    (useToastStore as unknown as Mock).mockReturnValue({
      showToast: showToastMock,
    });
  });

  it('renders login form', () => {
    renderLogin();
    expect(screen.getByText(/Inicjalizacja Sesji/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Identyfikator \(Email\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Klucz Dostępu \(Hasło\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /INICJUJ LOGOWANIE/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderLogin();
    const submitButton = screen.getByRole('button', { name: /INICJUJ LOGOWANIE/i });
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Nieprawidłowy format email')).toBeInTheDocument();
      expect(screen.getByText('Hasło jest wymagane')).toBeInTheDocument();
    });
  });

  it('calls signIn and navigates on successful login', async () => {
    signInMock.mockResolvedValueOnce({});
    renderLogin();

    fireEvent.change(screen.getByLabelText(/Identyfikator \(Email\)/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Klucz Dostępu \(Hasło\)/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /INICJUJ LOGOWANIE/i }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(showToastMock).toHaveBeenCalledWith('Pomyślnie zalogowano', 'success');
    });
  });

  it('shows error toast if login fails', async () => {
    signInMock.mockRejectedValueOnce(new Error('Błędne dane'));
    renderLogin();

    fireEvent.change(screen.getByLabelText(/Identyfikator \(Email\)/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Klucz Dostępu \(Hasło\)/i), { target: { value: 'wrong-password' } });
    
    fireEvent.click(screen.getByRole('button', { name: /INICJUJ LOGOWANIE/i }));

    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith('Błędne dane', 'error');
    });
  });
});
