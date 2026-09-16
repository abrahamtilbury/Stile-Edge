const MAX_PHOTOS = 3;
const MAX_PHOTO_SIZE = 4 * 1024 * 1024;
const MAX_TOTAL_PHOTO_SIZE = 8 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif"
]);

export default {
    async fetch(request, env) {
        const origin = request.headers.get("Origin") || "";
        const allowedOrigins = getCsv(env.ALLOWED_ORIGINS);

        const cors = {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Vary": "Origin"
        };

        /* ----------------------------------------
           CORS / ORIGIN
        ---------------------------------------- */

        if (!allowedOrigins.includes(origin)) {
            return json(
                { error: "Request origin not allowed." },
                403
            );
        }

        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: cors
            });
        }

        if (request.method !== "POST") {
            return json(
                { error: "Method not allowed." },
                405,
                cors
            );
        }

        const url = new URL(request.url);

        if (url.pathname !== "/enquiry") {
            return json(
                { error: "Not found." },
                404,
                cors
            );
        }

        try {
            const form = await request.formData();

            /* ----------------------------------------
               HONEYPOT
            ---------------------------------------- */

            const website =
                String(form.get("website") || "").trim();

            if (website) {
                /*
                   Pretend everything worked.
                   Do not tell bots why they were rejected.
                */
                return json(
                    { success: true },
                    200,
                    cors
                );
            }

            /* ----------------------------------------
               TURNSTILE
            ---------------------------------------- */

            const token =
                String(
                    form.get("cf-turnstile-response") || ""
                );

            if (!token || token.length > 2048) {
                return json(
                    {
                        error:
                            "Please complete the verification check."
                    },
                    403,
                    cors
                );
            }

            const turnstileResult =
                await verifyTurnstile(
                    token,
                    request,
                    env
                );

            const allowedHostnames =
                getCsv(env.TURNSTILE_HOSTNAMES);

            if (
                !turnstileResult.success ||
                !allowedHostnames.includes(
                    turnstileResult.hostname
                ) ||
                turnstileResult.action !== "contact"
            ) {
                return json(
                    {
                        error:
                            "Verification failed. Please try again."
                    },
                    403,
                    cors
                );
            }

            /* ----------------------------------------
               FORM VALUES
            ---------------------------------------- */

            const name =
                cleanSingleLine(
                    form.get("name"),
                    100
                );

            const email =
                cleanSingleLine(
                    form.get("email"),
                    254
                );

            const phone =
                cleanSingleLine(
                    form.get("phone"),
                    50
                );

            const company =
                cleanSingleLine(
                    form.get("company"),
                    120
                );

            const message =
                cleanMultiline(
                    form.get("message"),
                    5000
                );

            if (!name) {
                return json(
                    { error: "Please enter your name." },
                    400,
                    cors
                );
            }

            if (!isValidEmail(email)) {
                return json(
                    {
                        error:
                            "Please enter a valid email address."
                    },
                    400,
                    cors
                );
            }

            if (!message) {
                return json(
                    {
                        error:
                            "Please include your project details."
                    },
                    400,
                    cors
                );
            }

            /* ----------------------------------------
               PHOTO ATTACHMENTS
            ---------------------------------------- */

            const photos =
                form
                    .getAll("photos")
                    .filter(
                        item =>
                            item instanceof File &&
                            item.size > 0
                    );

            if (photos.length > MAX_PHOTOS) {
                return json(
                    {
                        error:
                            `Please attach no more than ${MAX_PHOTOS} photos.`
                    },
                    400,
                    cors
                );
            }

            let totalPhotoSize = 0;

            for (const photo of photos) {
                if (
                    !ALLOWED_PHOTO_TYPES.has(
                        photo.type
                    )
                ) {
                    return json(
                        {
                            error:
                                "Photos must be JPEG, PNG, WebP, HEIC or HEIF."
                        },
                        400,
                        cors
                    );
                }

                if (
                    photo.size >
                    MAX_PHOTO_SIZE
                ) {
                    return json(
                        {
                            error:
                                "Each photo must be 4 MB or smaller."
                        },
                        400,
                        cors
                    );
                }

                totalPhotoSize += photo.size;
            }

            if (
                totalPhotoSize >
                MAX_TOTAL_PHOTO_SIZE
            ) {
                return json(
                    {
                        error:
                            "Your photos must total 8 MB or less."
                    },
                    400,
                    cors
                );
            }

            const attachments =
                await Promise.all(
                    photos.map(async photo => ({
                        filename:
                            safeFilename(photo.name),
                        content:
                            await photo.arrayBuffer(),
                        type: photo.type,
                        disposition: "attachment"
                    }))
                );

            /* ----------------------------------------
               EMAIL CONTENT
            ---------------------------------------- */

            const subject =
                `Website enquiry — ${name}`;

            const text = [
                "NEW STILE EDGE WEBSITE ENQUIRY",
                "",
                `Name: ${name}`,
                `Email: ${email}`,
                `Phone: ${phone || "Not provided"}`,
                `Company: ${company || "Not provided"}`,
                "",
                "PROJECT DETAILS",
                "",
                message,
                "",
                photos.length
                    ? `Photos attached: ${photos.length}`
                    : "Photos attached: None"
            ].join("\n");

            const html = `
                <div style="
                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;
                    max-width: 680px;
                    margin: 0 auto;
                    color: #111;
                    line-height: 1.6;
                ">
                    <h1 style="
                        font-size: 22px;
                        margin-bottom: 24px;
                    ">
                        New Stile Edge website enquiry
                    </h1>

                    <p>
                        <strong>Name:</strong>
                        ${escapeHtml(name)}
                    </p>

                    <p>
                        <strong>Email:</strong>
                        ${escapeHtml(email)}
                    </p>

                    <p>
                        <strong>Phone:</strong>
                        ${escapeHtml(
                            phone || "Not provided"
                        )}
                    </p>

                    <p>
                        <strong>Company:</strong>
                        ${escapeHtml(
                            company || "Not provided"
                        )}
                    </p>

                    <hr style="
                        border: 0;
                        border-top: 1px solid #ddd;
                        margin: 28px 0;
                    ">

                    <h2 style="font-size: 18px;">
                        Project details
                    </h2>

                    <p style="white-space: pre-wrap;">${escapeHtml(
                        message
                    )}</p>

                    ${
                        photos.length
                            ? `<p><strong>${photos.length}</strong> photo${
                                  photos.length === 1
                                      ? ""
                                      : "s"
                              } attached.</p>`
                            : ""
                    }
                </div>
            `;

            /* ----------------------------------------
               SEND
            ---------------------------------------- */

            await env.EMAIL.send({
                to: env.TO_EMAIL,

                from: {
                    email: env.FROM_EMAIL,
                    name: "Stile Edge Website"
                },

                replyTo: {
                    email,
                    name
                },

                subject,
                text,
                html,

                attachments
            });

            return json(
                {
                    success: true,
                    message:
                        "Message sent successfully."
                },
                200,
                cors
            );

        } catch (error) {
            console.error(
                "Contact form error:",
                error
            );

            return json(
                {
                    error:
                        "Something went wrong. Please email sales@stileedge.com."
                },
                500,
                cors
            );
        }
    }
};


/* =========================================================
   TURNSTILE
========================================================= */

async function verifyTurnstile(
    token,
    request,
    env
) {
    const ip =
        request.headers.get(
            "CF-Connecting-IP"
        ) || "";

    const body =
        new URLSearchParams({
            secret:
                env.TURNSTILE_SECRET,
            response:
                token,
            remoteip:
                ip
        });

    const response =
        await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },
                body
            }
        );

    if (!response.ok) {
        return {
            success: false
        };
    }

    return response.json();
}


/* =========================================================
   VALIDATION / HELPERS
========================================================= */

function getCsv(value) {
    return String(value || "")
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
}


function cleanSingleLine(
    value,
    maxLength
) {
    return String(value || "")
        .replace(/[\r\n]+/g, " ")
        .trim()
        .slice(0, maxLength);
}


function cleanMultiline(
    value,
    maxLength
) {
    return String(value || "")
        .replace(/\r\n/g, "\n")
        .trim()
        .slice(0, maxLength);
}


function isValidEmail(email) {
    if (
        !email ||
        email.length > 254
    ) {
        return false;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}


function safeFilename(name) {
    const cleaned =
        String(name || "photo")
            .replace(
                /[^a-zA-Z0-9._() -]/g,
                "_"
            )
            .slice(0, 120);

    return cleaned || "photo";
}


function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function json(
    data,
    status = 200,
    extraHeaders = {}
) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: {
                "Content-Type":
                    "application/json; charset=UTF-8",
                "Cache-Control":
                    "no-store",
                ...extraHeaders
            }
        }
    );
}
