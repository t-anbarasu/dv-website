import re

with open('js/main.js', 'r') as f:
    content = f.read()

# 1. Add global variables
content = content.replace("let _currentProgram = null;", """let _currentProgram = null;
let _currentPromoCode = null;
let _currentDiscount = 0;
let _currentTax = 0;
let _currentFinalAmount = 0;
let _currentBaseAmount = 0;

function _updateBreakdownUI() {
  const elBase = document.getElementById('summary-base');
  const elDiscountRow = document.getElementById('summary-discount-row');
  const elDiscount = document.getElementById('summary-discount');
  const elTax = document.getElementById('summary-tax');
  const elTotal = document.getElementById('summary-total');
  const btnText = document.getElementById('reg-pay-btn-text');
  
  if (!elBase) return;
  
  elBase.textContent = '₹' + _currentBaseAmount.toLocaleString('en-IN');
  if (_currentDiscount > 0) {
    elDiscountRow.style.display = 'flex';
    elDiscount.textContent = '-₹' + _currentDiscount.toLocaleString('en-IN');
  } else {
    elDiscountRow.style.display = 'none';
  }
  elTax.textContent = '₹' + _currentTax.toLocaleString('en-IN');
  elTotal.textContent = '₹' + _currentFinalAmount.toLocaleString('en-IN');
  if (btnText) {
    btnText.textContent = `Pay ₹${_currentFinalAmount.toLocaleString('en-IN')} & Register`;
  }
}
""")

# 2. Reset vars in openRegModal
replace_open_reg = """  document.getElementById('reg-mode-badge').textContent     = p.mode;

  _currentPromoCode = null;
  _currentDiscount = 0;
  _currentTax = 0;
  _currentFinalAmount = 0;
  _currentBaseAmount = 0;

  const promoInput = document.getElementById('reg-promo-code');
  if (promoInput) promoInput.value = '';
  const promoMsg = document.getElementById('promo-message');
  if (promoMsg) { promoMsg.textContent = ''; promoMsg.style.color = ''; }

  if (course && course.price > 0) {
    _currentBaseAmount = course.price;
    _currentTax = Math.round(_currentBaseAmount * 0.18);
    _currentFinalAmount = _currentBaseAmount + _currentTax;
    _updateBreakdownUI();

    document.getElementById('reg-price').textContent = `₹${_currentBaseAmount.toLocaleString('en-IN')}`;
    document.getElementById('reg-price-row').style.display = '';
  } else {"""
content = content.replace("""  document.getElementById('reg-mode-badge').textContent     = p.mode;

  if (course && course.price > 0) {
    document.getElementById('reg-price').textContent = course.priceLabel;
    document.getElementById('reg-price-row').style.display = '';
    document.getElementById('reg-pay-btn-text').textContent = `Pay ${course.priceLabel} & Register`;
  } else {""", replace_open_reg)

# 3. Handle Razorpay launch amounts
content = content.replace("const amountPaise = course.price * 100;", "const amountPaise = _currentFinalAmount * 100;")

# 4. Modify fetch api/register.php payloads (both TEST and PROD)
content = re.sub(
    r"razorpay_payment_id:\s*'TEST_BYPASS_' \+ Date\.now\(\),\s*amount_paid_inr:\s*course\.price",
    r"razorpay_payment_id: 'TEST_BYPASS_' + Date.now(),\n        amount_paid_inr: _currentFinalAmount,\n        base_amount_inr: _currentBaseAmount,\n        promo_code: _currentPromoCode,\n        discount_amount_inr: _currentDiscount,\n        tax_amount_inr: _currentTax",
    content
)

content = re.sub(
    r"razorpay_payment_id:\s*response\.razorpay_payment_id,\s*amount_paid_inr:\s*course\.price",
    r"razorpay_payment_id: response.razorpay_payment_id,\n            amount_paid_inr: _currentFinalAmount,\n            base_amount_inr: _currentBaseAmount,\n            promo_code: _currentPromoCode,\n            discount_amount_inr: _currentDiscount,\n            tax_amount_inr: _currentTax",
    content
)

# 5. Add DOMContentLoaded event for Promo button
promo_listener = """
document.addEventListener('DOMContentLoaded', () => {
  const promoBtn = document.getElementById('reg-promo-btn');
  if (promoBtn) {
    promoBtn.addEventListener('click', async () => {
      const code = document.getElementById('reg-promo-code').value.trim().toUpperCase();
      const msgEl = document.getElementById('promo-message');
      
      if (!code) {
        msgEl.textContent = 'Please enter a promo code.';
        msgEl.style.color = '#ef4444';
        return;
      }
      
      promoBtn.disabled = true;
      promoBtn.textContent = 'Applying...';
      
      try {
        const res = await fetch('api/validate-promo.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ promo_code: code, base_amount: _currentBaseAmount })
        });
        const data = await res.json();
        
        if (data.success) {
          _currentPromoCode = code;
          _currentDiscount = data.discount_amount;
          _currentTax = data.tax_amount;
          _currentFinalAmount = data.final_amount;
          _updateBreakdownUI();
          msgEl.textContent = `Promo code applied successfully!`;
          msgEl.style.color = '#16a34a';
        } else {
          msgEl.textContent = data.error || 'Invalid promo code.';
          msgEl.style.color = '#ef4444';
          // reset
          _currentPromoCode = null;
          _currentDiscount = 0;
          _currentTax = Math.round(_currentBaseAmount * 0.18);
          _currentFinalAmount = _currentBaseAmount + _currentTax;
          _updateBreakdownUI();
        }
      } catch (err) {
        msgEl.textContent = 'Error validating promo code.';
        msgEl.style.color = '#ef4444';
      } finally {
        promoBtn.disabled = false;
        promoBtn.textContent = 'Apply';
      }
    });
  }
});
"""
content += promo_listener

with open('js/main.js', 'w') as f:
    f.write(content)

