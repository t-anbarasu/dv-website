<?php
/**
 * Utility to send emails via Zoho Mail using PHPMailer.
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/lib/PHPMailer/Exception.php';
require_once __DIR__ . '/lib/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/lib/PHPMailer/SMTP.php';
require_once __DIR__ . '/config.php';

/**
 * Send a welcome email to a participant.
 *
 * @param string $toEmail Participant's email address
 * @param string $toName Participant's full name
 * @param string $programName Name of the program
 * @param string $dateDisplay Date of the program (e.g. "May 9–10, 2026")
 * @param string $venue Venue details
 * @return bool True on success, false on failure
 */
function sendWelcomeEmail($toEmail, $toName, $programName, $dateDisplay, $venue) {
    $mail = new PHPMailer(true);

    try {
        // Retrieve settings from env.php (with fallbacks if not defined yet)
        $smtpHost = defined('ZOHO_SMTP_HOST') ? ZOHO_SMTP_HOST : 'smtp.zoho.in';
        $smtpUser = defined('ZOHO_SMTP_USER') ? ZOHO_SMTP_USER : '';
        $smtpPass = defined('ZOHO_SMTP_PASS') ? ZOHO_SMTP_PASS : '';
        $smtpPort = defined('ZOHO_SMTP_PORT') ? ZOHO_SMTP_PORT : 465;

        if (empty($smtpUser) || empty($smtpPass)) {
            error_log("Email not sent: ZOHO_SMTP_USER or ZOHO_SMTP_PASS is not configured.");
            return false;
        }

        // Server settings
        $mail->isSMTP();
        $mail->Host       = $smtpHost;
        $mail->SMTPAuth   = true;
        $mail->Username   = $smtpUser;
        $mail->Password   = $smtpPass;
        $mail->SMTPSecure = ($smtpPort == 465) ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = $smtpPort;

        // Recipients
        $mail->setFrom($smtpUser, 'Drishta Vidya');
        $mail->addAddress($toEmail, $toName);

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Welcome to "' . htmlspecialchars($programName) . '" - A great step in your transformation journey.';
        
        // Construct the HTML body
        $bodyHtml = '
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
            <p>Dear ' . htmlspecialchars($toName) . ',</p>
            <p>Welcome to <strong>' . htmlspecialchars($programName) . '</strong>! We are thrilled to have you join us. This marks a great step in your transformation journey, and we look forward to exploring new insights together.</p>
            
            <h3 style="color: #1a365d;">Course Details</h3>
            <ul style="list-style: none; padding: 0;">
                <li><strong>Date:</strong> ' . htmlspecialchars($dateDisplay) . '</li>
                <li><strong>Venue:</strong> ' . htmlspecialchars($venue) . '</li>
            </ul>
            
            <p>To help you get the most out of your experience, please feel free to explore other valuable resources on our website at <a href="https://drishtavidya.com/resources.html" style="color: #c8960c;">drishtavidya.com</a>.</p>
            
            <p>Thank you once again for choosing Drishta Vidya. If you have any questions or need further assistance, please do not hesitate to connect with our support team at <a href="mailto:support@drishtavidya.com" style="color: #c8960c;">support@drishtavidya.com</a>.</p>
            
            <p>Warm regards,<br>
            <strong>The Drishta Vidya Team</strong></p>
        </div>
        ';
        
        // Plain text alternative
        $bodyText = "Dear " . $toName . ",\n\n"
                  . "Welcome to \"" . $programName . "\"! We are thrilled to have you join us. This marks a great step in your transformation journey.\n\n"
                  . "Course Details:\n"
                  . "Date: " . $dateDisplay . "\n"
                  . "Venue: " . $venue . "\n\n"
                  . "Explore other resources on our website at https://drishtavidya.com/resources.html.\n\n"
                  . "Thank you once again for choosing Drishta Vidya. If you need any help, connect with our support team at support@drishtavidya.com.\n\n"
                  . "Warm regards,\n"
                  . "The Drishta Vidya Team";

        $mail->Body    = $bodyHtml;
        $mail->AltBody = $bodyText;

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
        return false;
    }
}
