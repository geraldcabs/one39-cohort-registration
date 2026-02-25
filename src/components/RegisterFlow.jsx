import { useState } from 'react'
import RegistrationForm from './RegistrationForm'
import PricingPage from './PricingPage'
import PaymentPage from './PaymentPage'

export default function RegisterFlow() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    churchName: '',
    position: '',
    coach: '',
    termsAccepted: false,
    noRecordingAccepted: false,
  })
  const [selectedPlan, setSelectedPlan] = useState(null)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <header className="header">
        <div className="header-inner">
          <img src="/logo 2.png" alt="One39 CreativeCircle" className="header-logo" />
        </div>
      </header>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {step === 1 && (
          <RegistrationForm
            formData={formData}
            setFormData={setFormData}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <PricingPage
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <PaymentPage
            formData={formData}
            selectedPlan={selectedPlan}
            onBack={() => setStep(2)}
          />
        )}
      </main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} One39. All rights reserved.</p>
      </footer>
      <div className="mockup-badge">&#9888; Client Mockup</div>
    </div>
  )
}
