// Email Service - Handle email notifications and confirmations
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailData {
  to: string;
  template: string;
  data: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/email') {
    this.baseUrl = baseUrl;
  }

  // Send email
  async sendEmail(emailData: EmailData): Promise<EmailResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || 'Failed to send email',
        };
      }

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  // Order confirmation email
  async sendOrderConfirmation(orderData: {
    orderId: string;
    customerEmail: string;
    customerName: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    total: number;
    shippingAddress: any;
    estimatedDelivery: string;
  }): Promise<EmailResponse> {
    const template = this.generateOrderConfirmationTemplate(orderData);
    
    return this.sendEmail({
      to: orderData.customerEmail,
      template: 'order-confirmation',
      data: {
        orderId: orderData.orderId,
        customerName: orderData.customerName,
        items: orderData.items,
        total: orderData.total,
        shippingAddress: orderData.shippingAddress,
        estimatedDelivery: orderData.estimatedDelivery,
        subject: template.subject,
        html: template.html,
        text: template.text,
      },
    });
  }

  // Order status update email
  async sendOrderStatusUpdate(orderData: {
    orderId: string;
    customerEmail: string;
    customerName: string;
    status: string;
    trackingNumber?: string;
    trackingUrl?: string;
  }): Promise<EmailResponse> {
    const template = this.generateOrderStatusTemplate(orderData);
    
    return this.sendEmail({
      to: orderData.customerEmail,
      template: 'order-status-update',
      data: {
        orderId: orderData.orderId,
        customerName: orderData.customerName,
        status: orderData.status,
        trackingNumber: orderData.trackingNumber,
        trackingUrl: orderData.trackingUrl,
        subject: template.subject,
        html: template.html,
        text: template.text,
      },
    });
  }

  // Welcome email for new users
  async sendWelcomeEmail(userData: {
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<EmailResponse> {
    const template = this.generateWelcomeTemplate(userData);
    
    return this.sendEmail({
      to: userData.email,
      template: 'welcome',
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        subject: template.subject,
        html: template.html,
        text: template.text,
      },
    });
  }

  // Password reset email
  async sendPasswordResetEmail(userData: {
    email: string;
    firstName: string;
    resetToken: string;
    resetUrl: string;
  }): Promise<EmailResponse> {
    const template = this.generatePasswordResetTemplate(userData);
    
    return this.sendEmail({
      to: userData.email,
      template: 'password-reset',
      data: {
        firstName: userData.firstName,
        resetToken: userData.resetToken,
        resetUrl: userData.resetUrl,
        subject: template.subject,
        html: template.html,
        text: template.text,
      },
    });
  }

  // Newsletter subscription confirmation
  async sendNewsletterConfirmation(email: string): Promise<EmailResponse> {
    const template = this.generateNewsletterTemplate(email);
    
    return this.sendEmail({
      to: email,
      template: 'newsletter-confirmation',
      data: {
        email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      },
    });
  }

  // Contact form notification (to admin)
  async sendContactNotification(contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
    category: string;
  }): Promise<EmailResponse> {
    const template = this.generateContactNotificationTemplate(contactData);
    
    return this.sendEmail({
      to: 'admin@casa-petrada.de', // Admin email
      template: 'contact-notification',
      data: {
        name: contactData.name,
        email: contactData.email,
        subject: contactData.subject,
        message: contactData.message,
        category: contactData.category,
        subject: template.subject,
        html: template.html,
        text: template.text,
      },
    });
  }

  // Template generators
  private generateOrderConfirmationTemplate(orderData: any): EmailTemplate {
    const subject = `Bestellbestätigung - Casa Petrada (${orderData.orderId})`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bestellbestätigung</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #c4a484; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f6f2; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-weight: bold; font-size: 18px; color: #c4a484; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CASA-PETRADA</h1>
            <p>Handmade Boho Schmuck</p>
          </div>
          <div class="content">
            <h2>Vielen Dank für deine Bestellung!</h2>
            <p>Liebe/r ${orderData.customerName},</p>
            <p>vielen Dank für deine Bestellung bei Casa Petrada. Wir haben deine Bestellung erhalten und werden sie schnellstmöglich bearbeiten.</p>
            
            <div class="order-details">
              <h3>Bestelldetails</h3>
              <p><strong>Bestellnummer:</strong> ${orderData.orderId}</p>
              <p><strong>Geschätzte Lieferzeit:</strong> ${orderData.estimatedDelivery}</p>
              
              <h4>Bestellte Artikel:</h4>
              ${orderData.items.map((item: any) => `
                <div class="item">
                  <span>${item.name} (${item.quantity}x)</span>
                  <span>${(item.price * item.quantity).toFixed(2)} €</span>
                </div>
              `).join('')}
              
              <div class="total">
                <span>Gesamt: ${orderData.total.toFixed(2)} €</span>
              </div>
            </div>
            
            <p>Wir senden dir eine weitere E-Mail, sobald deine Bestellung versandt wurde.</p>
            <p>Bei Fragen stehen wir dir gerne zur Verfügung.</p>
          </div>
          <div class="footer">
            <p>Casa Petrada - Handmade Boho Schmuck</p>
            <p>E-Mail: info@casa-petrada.de | Web: www.casa-petrada.de</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Bestellbestätigung - Casa Petrada
      
      Liebe/r ${orderData.customerName},
      
      vielen Dank für deine Bestellung bei Casa Petrada.
      
      Bestellnummer: ${orderData.orderId}
      Geschätzte Lieferzeit: ${orderData.estimatedDelivery}
      
      Bestellte Artikel:
      ${orderData.items.map((item: any) => `- ${item.name} (${item.quantity}x): ${(item.price * item.quantity).toFixed(2)} €`).join('\n')}
      
      Gesamt: ${orderData.total.toFixed(2)} €
      
      Wir senden dir eine weitere E-Mail, sobald deine Bestellung versandt wurde.
      
      Casa Petrada - Handmade Boho Schmuck
      E-Mail: info@casa-petrada.de
    `;

    return { subject, html, text };
  }

  private generateOrderStatusTemplate(orderData: any): EmailTemplate {
    const subject = `Bestellstatus Update - Casa Petrada (${orderData.orderId})`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bestellstatus Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #c4a484; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f6f2; }
          .status { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
          .tracking { background: #e8d5c4; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CASA-PETRADA</h1>
            <p>Handmade Boho Schmuck</p>
          </div>
          <div class="content">
            <h2>Bestellstatus Update</h2>
            <p>Liebe/r ${orderData.customerName},</p>
            <p>der Status deiner Bestellung ${orderData.orderId} hat sich geändert.</p>
            
            <div class="status">
              <h3>Neuer Status: ${orderData.status}</h3>
            </div>
            
            ${orderData.trackingNumber ? `
              <div class="tracking">
                <h4>Sendungsverfolgung</h4>
                <p><strong>Tracking-Nummer:</strong> ${orderData.trackingNumber}</p>
                ${orderData.trackingUrl ? `<p><a href="${orderData.trackingUrl}">Hier verfolgen</a></p>` : ''}
              </div>
            ` : ''}
            
            <p>Bei Fragen stehen wir dir gerne zur Verfügung.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Bestellstatus Update - Casa Petrada
      
      Liebe/r ${orderData.customerName},
      
      der Status deiner Bestellung ${orderData.orderId} hat sich geändert.
      
      Neuer Status: ${orderData.status}
      
      ${orderData.trackingNumber ? `
      Sendungsverfolgung:
      Tracking-Nummer: ${orderData.trackingNumber}
      ${orderData.trackingUrl ? `Verfolgen: ${orderData.trackingUrl}` : ''}
      ` : ''}
      
      Casa Petrada - Handmade Boho Schmuck
    `;

    return { subject, html, text };
  }

  private generateWelcomeTemplate(userData: any): EmailTemplate {
    const subject = 'Willkommen bei Casa Petrada!';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Willkommen</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #c4a484; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f6f2; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CASA-PETRADA</h1>
            <p>Handmade Boho Schmuck</p>
          </div>
          <div class="content">
            <h2>Willkommen bei Casa Petrada!</h2>
            <p>Liebe/r ${userData.firstName},</p>
            <p>herzlich willkommen bei Casa Petrada! Wir freuen uns, dass du Teil unserer Community geworden bist.</p>
            <p>Entdecke unsere einzigartigen handgefertigten Schmuckstücke und Mode.</p>
            <p>Bei Fragen stehen wir dir gerne zur Verfügung.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Willkommen bei Casa Petrada!
      
      Liebe/r ${userData.firstName},
      
      herzlich willkommen bei Casa Petrada! Wir freuen uns, dass du Teil unserer Community geworden bist.
      
      Entdecke unsere einzigartigen handgefertigten Schmuckstücke und Mode.
      
      Casa Petrada - Handmade Boho Schmuck
    `;

    return { subject, html, text };
  }

  private generatePasswordResetTemplate(userData: any): EmailTemplate {
    const subject = 'Passwort zurücksetzen - Casa Petrada';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Passwort zurücksetzen</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #c4a484; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f6f2; }
          .button { background: #c4a484; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CASA-PETRADA</h1>
            <p>Handmade Boho Schmuck</p>
          </div>
          <div class="content">
            <h2>Passwort zurücksetzen</h2>
            <p>Liebe/r ${userData.firstName},</p>
            <p>du hast eine Anfrage zum Zurücksetzen deines Passworts erhalten.</p>
            <p>Klicke auf den folgenden Link, um ein neues Passwort zu erstellen:</p>
            <p><a href="${userData.resetUrl}" class="button">Passwort zurücksetzen</a></p>
            <p>Dieser Link ist 24 Stunden gültig.</p>
            <p>Falls du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Passwort zurücksetzen - Casa Petrada
      
      Liebe/r ${userData.firstName},
      
      du hast eine Anfrage zum Zurücksetzen deines Passworts erhalten.
      
      Klicke auf den folgenden Link, um ein neues Passwort zu erstellen:
      ${userData.resetUrl}
      
      Dieser Link ist 24 Stunden gültig.
      
      Falls du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail.
      
      Casa Petrada - Handmade Boho Schmuck
    `;

    return { subject, html, text };
  }

  private generateNewsletterTemplate(email: string): EmailTemplate {
    const subject = 'Newsletter-Anmeldung bestätigt - Casa Petrada';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Newsletter-Anmeldung</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #c4a484; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f6f2; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CASA-PETRADA</h1>
            <p>Handmade Boho Schmuck</p>
          </div>
          <div class="content">
            <h2>Newsletter-Anmeldung bestätigt</h2>
            <p>Vielen Dank für deine Anmeldung zu unserem Newsletter!</p>
            <p>Du erhältst ab sofort exklusive Angebote und Neuigkeiten über unsere handgefertigten Schmuckstücke.</p>
            <p>Bei Fragen stehen wir dir gerne zur Verfügung.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Newsletter-Anmeldung bestätigt - Casa Petrada
      
      Vielen Dank für deine Anmeldung zu unserem Newsletter!
      
      Du erhältst ab sofort exklusive Angebote und Neuigkeiten über unsere handgefertigten Schmuckstücke.
      
      Casa Petrada - Handmade Boho Schmuck
    `;

    return { subject, html, text };
  }

  private generateContactNotificationTemplate(contactData: any): EmailTemplate {
    const subject = `Neue Kontaktanfrage - ${contactData.subject}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Kontaktanfrage</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #c4a484; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f6f2; }
          .message { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Neue Kontaktanfrage</h1>
            <p>Casa Petrada Website</p>
          </div>
          <div class="content">
            <h2>Kontaktdaten</h2>
            <p><strong>Name:</strong> ${contactData.name}</p>
            <p><strong>E-Mail:</strong> ${contactData.email}</p>
            <p><strong>Kategorie:</strong> ${contactData.category}</p>
            <p><strong>Betreff:</strong> ${contactData.subject}</p>
            
            <div class="message">
              <h3>Nachricht:</h3>
              <p>${contactData.message}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Neue Kontaktanfrage - Casa Petrada
      
      Name: ${contactData.name}
      E-Mail: ${contactData.email}
      Kategorie: ${contactData.category}
      Betreff: ${contactData.subject}
      
      Nachricht:
      ${contactData.message}
    `;

    return { subject, html, text };
  }
}

export const emailService = new EmailService();