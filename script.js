// GAS WebアプリのURL（デプロイ後に設定）
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz2pTrKqCHQYei_qtA0y8HE2ic5E9CUBIvLQq3W5oNCUMs_a0SeUZTWVAAf3FVvMycUyw/exec';

document.addEventListener('DOMContentLoaded', function() {
    // 今日以降の日付のみ選択可能
    document.getElementById('date').min = new Date().toISOString().split('T')[0];
    
    document.getElementById('reservationForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const form = e.target;
        const formData = {
            resident: form.resident.value,
            visitor: form.visitor.value,
            date: form.date.value,
            time: form.time.value,
            phone: form.phone.value,
            note: form.note.value,
            userId: form.userId.value
        };

        const responseMessageDiv = document.getElementById('responseMessage');
        responseMessageDiv.style.display = 'none';

        const submitButton = form.querySelector('.btn-submit');
        submitButton.disabled = true;
        submitButton.textContent = '送信中...';

        // GAS Webアプリにデータ送信
        fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            submitButton.disabled = false;
            submitButton.textContent = '予約を送信';

            if (data.result === 'success') {
                responseMessageDiv.classList.remove('error');
                responseMessageDiv.classList.add('success');
                form.reset();
            } else {
                responseMessageDiv.classList.remove('success');
                responseMessageDiv.classList.add('error');
            }
            responseMessageDiv.textContent = data.message;
            responseMessageDiv.style.display = 'block';
        })
        .catch(error => {
            submitButton.disabled = false;
            submitButton.textContent = '予約を送信';
            
            responseMessageDiv.classList.remove('success');
            responseMessageDiv.classList.add('error');
            responseMessageDiv.textContent = 'システムエラーが発生しました: ' + error.message;
            responseMessageDiv.style.display = 'block';
        });
    });
});
