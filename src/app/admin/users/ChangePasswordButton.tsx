'use client';

import { useState, useRef, useEffect } from 'react';
import { changeUserPassword } from '@/app/actions';

interface ChangePasswordButtonProps {
    userId: number;
    username: string;
}

export default function ChangePasswordButton({ userId, username }: ChangePasswordButtonProps) {
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus the input when modal opens
    useEffect(() => {
        if (open) {
            setPassword('');
            setMessage(null);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);
        try {
            const result = await changeUserPassword(userId, password);
            if (result.success) {
                setMessage({ type: 'success', text: `✅ Password updated for "${username}"!` });
                setPassword('');
                setTimeout(() => setOpen(false), 1200);
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to update password.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) setOpen(false);
    };

    return (
        <>
            {/* Trigger button */}
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
                🔑 Change Password
            </button>

            {/* Modal backdrop */}
            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    {/* Modal panel */}
                    <div
                        className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm mx-4 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-base font-bold text-gray-800">Change Password</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Setting a new password for{' '}
                                    <span className="font-semibold text-gray-700">{username}</span>
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                disabled={loading}
                                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 text-xl leading-none"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        {/* Feedback message */}
                        {message && (
                            <div
                                className={`text-sm px-4 py-3 rounded-lg border mb-4 ${message.type === 'success'
                                        ? 'bg-green-50 border-green-200 text-green-800'
                                        : 'bg-red-50 border-red-200 text-red-800'
                                    }`}
                            >
                                {message.text}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor={`new-password-${userId}`}
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    New Password
                                </label>
                                <input
                                    id={`new-password-${userId}`}
                                    ref={inputRef}
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    placeholder="Min. 6 characters"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-50 disabled:text-gray-400 transition"
                                />
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={loading}
                                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || password.length < 6}
                                    className="flex-1 py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <svg
                                                className="animate-spin h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Password'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
