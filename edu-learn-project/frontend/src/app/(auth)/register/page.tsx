'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { api } from '@/lib/utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/hooks/useAuth';

export default function RegisterPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    logout();
  }, []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});
    
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Họ và tên không được để trống.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email không được để trống.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Email không đúng định dạng.';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống.';
    } else if (!/^0(?:3|5|7|8|9)\d{8}$/.test(phone.trim())) {
      newErrors.phone = 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09.';
    }

    if (!password) {
      newErrors.password = 'Mật khẩu không được để trống.';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.';
    }

    if (!confirm) {
      newErrors.confirm = 'Vui lòng xác nhận mật khẩu.';
    } else if (password !== confirm) {
      newErrors.confirm = 'Xác nhận mật khẩu không trùng khớp.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await api.register({ full_name: name, email, phone, password });
      toast.success('🎉 Đăng ký thành công! Đang chuyển hướng sang Đăng nhập...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký tài khoản</h1>
        <p className="text-sm text-gray-500">Tham gia cùng hàng triệu khách hàng DRIVE MH</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Họ và tên" placeholder="Nguyễn Văn A" value={name} onChange={e => setName(e.target.value)} error={errors.name} />
        <Input label="Email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} />
        <Input label="Số điện thoại" type="tel" placeholder="Ví dụ: 0912345678" value={phone} onChange={e => setPhone(e.target.value)} error={errors.phone} />
        <Input label="Mật khẩu" type="password" placeholder="Tối thiểu 8 ký tự (chữ hoa, chữ thường, số, ký tự đặc biệt)" value={password} onChange={e => setPassword(e.target.value)} error={errors.password} />
        <Input label="Xác nhận mật khẩu" type="password" placeholder="Nhập lại mật khẩu" value={confirm} onChange={e => setConfirm(e.target.value)} error={errors.confirm} />

        <Button type="submit" fullWidth size="lg" loading={loading} className="!bg-gray-900 hover:!bg-gray-800 !rounded-xl font-semibold tracking-wide mt-2">
          Đăng ký tài khoản
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700">Đăng nhập</Link>
      </p>
    </div>
  );
}
