const CustomButton = ({title, containerStyles, type, onClick}) => {
  return (
    <button
    onClick={onClick}
    type={type || "button"}
    className={`inline-flex items-center text-base ${containerStyles}`}
    >
      {title}
    </button>
  )
}

export default CustomButton
