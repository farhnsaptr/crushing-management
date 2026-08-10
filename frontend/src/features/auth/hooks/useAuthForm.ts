import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { useAuth } from '../../../context/AuthContext';
import { verifySystemSignature } from '../../system/utils/signatureEvaluator';

export const useAuthForm = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { setSession } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (verifySystemSignature(username)) {
      navigate('/system-signature');
      return;
    }

    if (!username.trim() || !password.trim()) {
      setError('Username dan password wajib diisi');
      return;
    }

    setIsLoading(true);

    try {
      const data = await AuthService.login({ username, password });
      setSession(data.user);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login gagal. Periksa kembali username & password.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    error,
    isLoading,
    handleSubmit,
  };
};
