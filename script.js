// GAS WebアプリのURL（デプロイ後に設定）
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/あなたのGAS_SCRIPT_ID/exec';

document.addEventListener('DOMContentLoaded', function() {
    // 今日以降の日付のみ選択可能
    document.getElementById('date').min = new Date().toISOString().split('T')[0];
    
    // 電話番号入力の初期化
    initializePhoneInput();
    
    // フォーム送信イベント
    document.getElementById('reservationForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const form = e.target;
        const phoneValue = document.getElementById('phone').value.replace(/\D/g, '');
        
        // 最終バリデーション
        if (!validatePhoneNumber(phoneValue)) {
            return false;
        }

        const formData = {
            resident: form.resident.value,
            visitor: form.visitor.value,
            date: form.date.value,
            time: form.time.value,
            phone: phoneValue, // ハイフンなしの数値のみ送信
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
            
            // 成功時はメッセージを少しで消す
            if (data.result === 'success') {
                setTimeout(() => {
                    responseMessageDiv.style.display = 'none';
                }, 5000);
            }
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

// 電話番号入力の自動フォーマット
function initializePhoneInput() {
    const phoneInput = document.getElementById('phone');
    
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        // 11桁以上入力させない
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        
        e.target.value = value;
        
        // リアルタイムバリデーション
        validatePhoneNumber(value);
    });
    
    phoneInput.addEventListener('blur', function(e) {
        const value = e.target.value.replace(/\D/g, '');
        validatePhoneNumber(value);
    });
}

// 電話番号バリデーション
function validatePhoneNumber(phone) {
    const errorElement = document.getElementById('phoneError');
    const submitButton = document.querySelector('.btn-submit');
    
    if (phone.length === 0) {
        errorElement.textContent = '電話番号を入力してください';
        errorElement.style.display = 'block';
        submitButton.disabled = true;
        return false;
    } else if (phone.length < 10 || phone.length > 11) {
        errorElement.textContent = '電話番号は10桁または11桁で入力してください';
        errorElement.style.display = 'block';
        submitButton.disabled = true;
        return false;
    } else if (!/^\d+$/.test(phone)) {
        errorElement.textContent = '数字のみ入力してください';
        errorElement.style.display = 'block';
        submitButton.disabled = true;
        return false;
    } else {
        errorElement.style.display = 'none';
        submitButton.disabled = false;
        return true;
    }
}
