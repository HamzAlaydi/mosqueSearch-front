const FormNavigation = ({ prevStep, isSubmitting, isLoading }) => {
    return (
      <div className="form-navigation">
        <button
          type="button"
          onClick={prevStep}
          className="auth-button secondary"
        >
          Previous
        </button>
        <button
          type="submit"
          className="auth-button"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading
            ? "Creating Account..."
            : "Complete Registration"}
        </button>
      </div>
    );
  };
  
  export default FormNavigation;