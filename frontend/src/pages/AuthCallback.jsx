import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authApi from '../api/authApi';

export default function AuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
            navigate('/login?error=' + encodeURIComponent(error), { replace: true });
            return;
        }

        if (token) {
            localStorage.setItem('token', token);

            if (userParam) {
                try {
                    const parsedUser = JSON.parse(decodeURIComponent(userParam));
                    localStorage.setItem('user', JSON.stringify(parsedUser));
                    window.dispatchEvent(new Event('auth-change'));
                    window.dispatchEvent(new Event('storage'));
                } catch (e) {
                    console.error('Error parsing user param from Google callback', e);
                }
            }

            // Đồng bộ profile chuẩn từ backend
            authApi.getProfile()
                .then((res) => {
                    if (res.data?.status && res.data?.data) {
                        localStorage.setItem('user', JSON.stringify(res.data.data));
                        window.dispatchEvent(new Event('auth-change'));
                        window.dispatchEvent(new Event('storage'));
                    }
                    navigate('/', { replace: true });
                })
                .catch(() => {
                    window.dispatchEvent(new Event('auth-change'));
                    navigate('/', { replace: true });
                });
        } else {
            navigate('/login', { replace: true });
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 border-3 border-[#8C6A48]/30 border-t-[#8C6A48] rounded-full animate-spin mb-4" />
            <h3 className="font-serif text-lg font-medium text-stone-900 tracking-wide">
                Đang hoàn tất đăng nhập Google...
            </h3>
            <p className="text-xs text-stone-500 mt-1">
                Hệ thống đang đồng bộ dữ liệu tài khoản TK House của Quý khách.
            </p>
        </div>
    );
}
