curl -X POST http://localhost:8787/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email": "dominik@portcity-ai.com"}'

curl -X POST http://localhost:8787/auth/otp \
 -H "Content-Type: application/json" \
 -d '{"email": "dominik@portcity-ai.com", "otp": "380359"}'

{"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkb21pbmlrQHBvcnRjaXR5LWFpLmNvbSIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJleHAiOjE3MjY3NzA2NDl9.zjjP5iYPeMdWEJ5RaFmjJc46yymCNWGBfJ9JuPI6W_s","refreshToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkb21pbmlrQHBvcnRjaXR5LWFpLmNvbSIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJyZWZyZXNoIiwiZXhwIjoxNzI2NzcwOTUzOTAyfQ.Yh70_wi0RgBDHw03OKq79i5AdVcs79h4T2C8YEna4mc"}

curl -X POST http://localhost:8787/auth/refresh \
 -H "Content-Type: application/json" \
 -H "X-Refresh-Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkb21pbmlrQHBvcnRjaXR5LWFpLmNvbSIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJyZWZyZXNoIiwiZXhwIjoxNzI2NzcwMzY0MTgwfQ.XK_T4dY1FeMs9lGIu7h2-ztRYJQpaoOPFCcR0ZZU-gc"

curl -X POST http://localhost:8787/auth/verify \
 -H "Content-Type: application/json" \
 -H "X-Access-Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkb21pbmlrQHBvcnRjaXR5LWFpLmNvbSIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJleHAiOjE3MjY3NjkxNzh9.JYEVtl0Xo0LJ6BCC9048jJ5HyPMCTfE_Mwp0EBS1sKk"

curl http://localhost:8787/secured \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkb21pbmlrQHBvcnRjaXR5LWFpLmNvbSIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJleHAiOjE3MjY3NzA2NDl9.zjjP5iYPeMdWEJ5RaFmjJc46yymCNWGBfJ9JuPI6W_s"
