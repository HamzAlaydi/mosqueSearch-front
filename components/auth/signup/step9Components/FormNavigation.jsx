const FormNavigation = ({ prevStep, isSubmitting, isLoading }) => {
    return (
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full items-center justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          disabled={isSubmitting || isLoading}
        >
          Previous
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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