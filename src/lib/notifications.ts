import { supabase } from './supabase';

export async function sendConsentNotification(
  email: string,
  phone: string | undefined,
  templateData: {
    guardianName: string;
    minorName: string;
    consentType: string;
    actionUrl: string;
  }
) {
  // Send email notification
  const { error: emailError } = await supabase.functions.invoke('send-notification', {
    body: {
      type: 'email',
      to: email,
      template: 'consent-request',
      data: templateData,
    },
  });

  if (emailError) {
    console.error('Failed to send email notification:', emailError);
  }

  // Send SMS if phone number is provided
  if (phone) {
    const { error: smsError } = await supabase.functions.invoke('send-notification', {
      body: {
        type: 'sms',
        to: phone,
        template: 'consent-request-sms',
        data: templateData,
      },
    });

    if (smsError) {
      console.error('Failed to send SMS notification:', smsError);
    }
  }
}