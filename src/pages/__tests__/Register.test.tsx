import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Register } from '../Register';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';

// Mock the stores
vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('../../store/toastStore', () => ({
  useToastStore: vi.fn(),
}));

const renderRegister = () => {
  return render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );
};

describe('Register Component', () => {
  const signUpMock = vi.fn();
  const showToastMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as unknown as Mock).mockReturnValue({
      signUp: signUpMock,
    });
    (useToastStore as unknown as Mock).mockReturnValue({
      showToast: showToastMock,
    });
  });

  it('renders register form', () => {
    renderRegister();
    expect(screen.getByText(/Inicjalizacja Konta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Imię Operatora/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nazwisko Operatora/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kanał Komunikacji \(Email\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hasło Dostępu/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Weryfikacja Hasła/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /UTWÓRZ PROFIL OPERATORA/i })).toBeInTheDocument();
  });

  it('shows error if passwords do not match', async () => {
    renderRegister();
    
    fireEvent.change(screen.getByLabelText(/Kanał Komunikacji \(Email\)/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Hasło Dostępu/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Weryfikacja Hasła/i), { target: { value: 'mismatch' } });
    
    // Accept legal
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    fireEvent.click(screen.getByRole('button', { name: /UTWÓRZ PROFIL OPERATORA/i }));

    await waitFor(() => {
      expect(screen.getByText('Hasła nie są identyczne')).toBeInTheDocument();
    });
  });

  it('calls signUp and navigates on successful registration', async () => {
    signUpMock.mockResolvedValueOnce({});
    renderRegister();

    fireEvent.change(screen.getByLabelText(/Imię Operatora/i), { target: { value: 'Jan' } });
    fireEvent.change(screen.getByLabelText(/Nazwisko Operatora/i), { target: { value: 'Kowalski' } });
    fireEvent.change(screen.getByLabelText(/Kanał Komunikacji \(Email\)/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Hasło Dostępu/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Weryfikacja Hasła/i), { target: { value: 'password123' } });
    
    // Accept legal
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    
    fireEvent.click(screen.getByRole('button', { name: /UTWÓRZ PROFIL OPERATORA/i }));

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        first_name: 'Jan',
        last_name: 'Kowalski'
      }));
      expect(showToastMock).toHaveBeenCalledWith('Konto zostało pomyślnie utworzone', 'success');
    });
  });
});
