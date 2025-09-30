function getVerficationTemp(verificationLink) {
    return (
       `<!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
        
                .container {
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: #fff;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
        
                h1 {
                    color: #333;
                }
        
                p {
                    color: #555;
                    line-height: 1.6;
                }
        
                a.button {
                    display: inline-block;
                    padding: 12px 25px;
                    margin-top: 20px;
                    background-color: #28a745;
                    color: #fff !important;
                    text-decoration: none;
                    font-weight: bold;
                    border-radius: 5px;
                    cursor: pointer;
                }
        
                a.button:hover {
                    background-color: #218838;
                }
        
                .footer {
                    margin-top: 30px;
                    font-size: 12px;
                    color: #999;
                }
            </style>
        </head>
        
        <body>
            <div class="container">
                <h1>Welcome to Coffee App!</h1>
                <p>Hi there,</p>
                <p>Thank you for signing up! Please verify your email address to activate your account.</p>
                <a class="button" href="${verificationLink}">Verify Email</a>
                <p>If the button doesn’t work, copy and paste this link into your browser:</p>
                <p><a href="${verificationLink}" style="color:#28a745;">${verificationLink}</a></p>
                <div class="footer">
                    &copy; 2025 Coffee App. All rights reserved.
                </div>
            </div>
        </body>
        
        </html>`

    )
}

module.exports = {
    getVerficationTemp
}