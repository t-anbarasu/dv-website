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
            
            <div style="margin: 20px 0; padding: 16px; background: #f8f9fb; border-left: 4px solid #c8960c; border-radius: 4px;">
                <h4 style="margin: 0 0 8px; color: #0d2137;">Access Your EQ OS Companion</h4>
                <p style="margin: 0; font-size: 14px;">As a registered participant, you receive full access to your digital EQ OS companion tools, practice rituals, and AI rehearsal coach. An activation voucher code will be issued to your email to unlock your program modules at <a href="https://eqos.drishtavidya.com" style="color: #c8960c; font-weight: bold;">eqos.drishtavidya.com</a>.</p>
            </div>
            
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

/**
 * Send an enquiry notification to namaste@drishtavidya.com when contact form is submitted.
 *
 * @param array $formData Form submission fields
 * @return bool True on success, false on failure
 */
function sendEnquiryNotification($formData) {
    $mail = new PHPMailer(true);

    try {
        $smtpHost = defined('ZOHO_SMTP_HOST') ? ZOHO_SMTP_HOST : 'smtp.zoho.in';
        $smtpUser = defined('ZOHO_SMTP_USER') ? ZOHO_SMTP_USER : '';
        $smtpPass = defined('ZOHO_SMTP_PASS') ? ZOHO_SMTP_PASS : '';
        $smtpPort = defined('ZOHO_SMTP_PORT') ? ZOHO_SMTP_PORT : 465;

        if (empty($smtpUser) || empty($smtpPass)) {
            error_log("Enquiry email not sent: ZOHO_SMTP_USER or ZOHO_SMTP_PASS is not configured.");
            return false;
        }

        $fullName = trim(($formData['first_name'] ?? '') . ' ' . ($formData['last_name'] ?? ''));
        $course   = !empty($formData['course_interest']) ? $formData['course_interest'] : 'General Enquiry';

        // Server settings
        $mail->isSMTP();
        $mail->Host       = $smtpHost;
        $mail->SMTPAuth   = true;
        $mail->Username   = $smtpUser;
        $mail->Password   = $smtpPass;
        $mail->SMTPSecure = ($smtpPort == 465) ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = $smtpPort;

        // Recipients
        $mail->setFrom($smtpUser, 'Drishta Vidya Website');
        $mail->addAddress('namaste@drishtavidya.com', 'Drishta Vidya Team');

        if (!empty($formData['email'])) {
            $mail->addReplyTo($formData['email'], $fullName ?: $formData['email']);
        }

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'New Website Enquiry: ' . $course . ' (' . ($fullName ?: 'Website Visitor') . ')';

        $bodyHtml = '
        <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
            <div style="border-bottom: 2px solid #c8960c; padding-bottom: 12px; margin-bottom: 20px;">
                <h2 style="color: #0d2137; margin: 0; font-size: 20px;">New Enquiry from Website</h2>
                <span style="font-size: 13px; color: #64748b;">Submitted via drishtavidya.com/contact.html</span>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; width: 140px; color: #64748b;">Name:</td>
                    <td style="padding: 8px 0; color: #0d2137; font-size: 15px;"><strong>' . htmlspecialchars($fullName ?: 'Not provided') . '</strong></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Email:</td>
                    <td style="padding: 8px 0;"><a href="mailto:' . htmlspecialchars($formData['email'] ?? '') . '" style="color: #2563eb; text-decoration: none;">' . htmlspecialchars($formData['email'] ?? 'Not provided') . '</a></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Phone:</td>
                    <td style="padding: 8px 0; color: #0d2137;">' . htmlspecialchars($formData['phone'] ?? 'Not provided') . '</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Organization:</td>
                    <td style="padding: 8px 0; color: #0d2137;">' . htmlspecialchars($formData['organization'] ?? 'Not provided') . '</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Program:</td>
                    <td style="padding: 8px 0; color: #0d2137;"><strong>' . htmlspecialchars($course) . '</strong></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Team Size:</td>
                    <td style="padding: 8px 0; color: #0d2137;">' . htmlspecialchars($formData['team_size'] ?? 'Not specified') . '</td>
                </tr>
            </table>

            <div style="padding: 16px; background: #f8f9fb; border-left: 4px solid #0d2137; border-radius: 4px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 8px; color: #0d2137; font-size: 14px;">Message:</h4>
                <p style="margin: 0; font-size: 14.5px; color: #334155; white-space: pre-wrap;">' . htmlspecialchars($formData['message'] ?? '') . '</p>
            </div>

            <p style="font-size: 12px; color: #94a3b8; margin: 0; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                You can reply directly to this email to respond to ' . htmlspecialchars($fullName ?: 'the sender') . '.
            </p>
        </div>';

        $bodyText = "New Website Enquiry Received\n\n"
                  . "Name: " . ($fullName ?: 'Not provided') . "\n"
                  . "Email: " . ($formData['email'] ?? 'Not provided') . "\n"
                  . "Phone: " . ($formData['phone'] ?? 'Not provided') . "\n"
                  . "Organization: " . ($formData['organization'] ?? 'Not provided') . "\n"
                  . "Program: " . $course . "\n"
                  . "Team Size: " . ($formData['team_size'] ?? 'Not specified') . "\n\n"
                  . "Message:\n" . ($formData['message'] ?? '') . "\n";

        $mail->Body    = $bodyHtml;
        $mail->AltBody = $bodyText;

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Enquiry notification failed. Mailer Error: {$mail->ErrorInfo}");
        return false;
    }
}

