import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Button, Icons } from '@/components';

import { useTranslation } from 'react-i18next';

export function VerifyEmail() {
  const { t } = useTranslation();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  const email = queryParams.get('email');

  const navigate = useNavigate();

  if (!token || !email) navigate('/auth');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [verifiedEmail, setVerifiedEmail] = useState<boolean>(false);
  const [tokenInvalidOrExpired, setTokenInvalidOrExpired] = useState<boolean>(false);
  const [resendedVerficationEmail, setResendedVerificaitonEmail] = useState<boolean>(false);

  async function verifyEmail() {
    setIsLoading(true);
    const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/accounts/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
      }),
    });

    if (resp.status === 200) {
      setVerifiedEmail(true);
    } else {
      setTokenInvalidOrExpired(true);
    }

    setIsLoading(false);
  }

  async function resendVerificationEmail() {
    setIsLoading(true);
    const resp = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/accounts/resend-verification-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      },
    );

    if (resp.status === 200) {
      setResendedVerificaitonEmail(true);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    verifyEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t('verifyEmail')}</h1>
      </div>
      <div className="grid gap-6">
        {!verifiedEmail && isLoading && <Icons.loading className="mx-auto h-4 w-4 animate-spin" />}

        {verifiedEmail && (
          <div className="text-center ">
            <div className="text-sm">{t('emailWasVerified')}</div>
            <Link to={`/auth?${new URLSearchParams([['email', email || '']]).toString()}`}>
              <Button variant="link" className="underline">
                {t('goToLogin')}
              </Button>
            </Link>
          </div>
        )}

        {tokenInvalidOrExpired && (
          <div>
            {!resendedVerficationEmail ? (
              <div className="flex gap-6 flex-col">
                <div className="text-center text-sm text-destructive">
                  {t('emailVerifictionTokenExpired')}
                </div>
                <Button
                  disabled={isLoading}
                  className="w-full"
                  onClick={() => resendVerificationEmail()}
                >
                  {isLoading && <Icons.loading className="mr-2 h-4 w-4 animate-spin" />}
                  {t('resendVerificationEmail')}
                </Button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center">
                {t('resendedVerificationEmail')}
              </div>
            )}
            {}
          </div>
        )}
      </div>
    </>
  );
}
