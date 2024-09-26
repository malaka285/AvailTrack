import React, { useRef, useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_inlwaa9';
const TEMPLATE_ID = 'template_uru9xro';
const PUBLIC_KEY = '346-mgpUk74BD7OWC';

export const Notifikasi = () => {
    const form = useRef();
    const [status, setStatus] = useState('');

    useEffect(() => {
        emailjs.init(PUBLIC_KEY); // Inisialisasi EmailJS
    }, []);

    const SendEmail = (e) => {
        e.preventDefault();

        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current)
            .then((result) => {
                console.log('SUCCESS!', result.status, result.text);
                setStatus('Email berhasil dikirim!');
            }, (error) => {
                console.log('FAILED...', error);
                setStatus('Gagal mengirim email: ' + error.text);
            });
    };

    return (
        <div>
            <form ref={form} onSubmit={SendEmail} id="myForm">
                <label>Name</label>
                <input type="text" name="from_name" required />
                <label>Email</label>
                <input type="email" name="from_email" required />
                <label>Message</label>
                <textarea name="message" required />
                <input type="submit" value="Send" />
            </form>
            {status && <p>{status}</p>} {/* Tampilkan status */}
        </div>
    );
};
