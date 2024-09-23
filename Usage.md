curl -X POST http://localhost:8787/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email": "dominik@portcity-ai.com"}'

curl -X POST http://localhost:8787/auth/otp \
 -H "Content-Type: application/json" \
 -d '{"email": "dominik@portcity-ai.com", "otp": "947501"}'

{"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkb21pbmlrQHBvcnRjaXR5LWFpLmNvbSIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJleHAiOjE3MjY3NzI0NDR9.Z_PkpWjCMSJNL4XYL6QZRT8dv73S89JwjBnWzq43VNY","refreshToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkb21pbmlrQHBvcnRjaXR5LWFpLmNvbSIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJyZWZyZXNoIiwiZXhwIjoxNzI2NzcyNzQ4ODI3fQ.RtXZh3cJ9lS_Og5AEye1pgz2QhjavVxyr80_01vxGc8"}

curl -X POST http://localhost:8787/auth/refresh \
 -H "Content-Type: application/json" \
 -H "X-Refresh-Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkb21pbmlrQHBvcnRjaXR5LWFpLmNvbSIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJyZWZyZXNoIiwiZXhwIjoxNzI2NzcxODUzODI1fQ.PIW24gG4xO7GUBtUMPrbGSzYjZaSQaI-uXU_bEtLQVw"

curl -X POST http://localhost:8787/auth/verify \
 -H "Content-Type: application/json" \
 -H "X-Access-Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkb21pbmlrQHBvcnRjaXR5LWFpLmNvbSIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJleHAiOjE3MjY3NjkxNzh9.JYEVtl0Xo0LJ6BCC9048jJ5HyPMCTfE_Mwp0EBS1sKk"

curl http://localhost:8787/secured \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkb21pbmlrQHBvcnRjaXR5LWFpLmNvbSIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJyZWZyZXNoIiwiZXhwIjoxNzI2NzcyNDg3NTM1fQ.UGORutJIFfm95Mc6qvpn76uWxHNn1-Vas0bqtcDbD2o"

curl http://localhost:8787/admin/users \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkb21pbmlrQHBvcnRjaXR5LWFpLmNvbSIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJleHAiOjE3MjY3NzI0NDR9.Z_PkpWjCMSJNL4XYL6QZRT8dv73S89JwjBnWzq43VNY"
