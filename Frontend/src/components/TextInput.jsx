import React from 'react'

const TextInput = React.forwardRef( 
    (
         {type, placeholder, styles, label, labelStyles, register, name, error},
        ref
)=> {
  return (
    <div className='w-full flex flex-col mt-2'>
      {label && 
      <p className={`text-ascent-2 text-sm mb-2 ${labelStyles}`}>{label}</p>}

      <div>
        <input
        type={type}
        placeholder={placeholder}
        name={name}
        ref={ref}
        className={`bg-secondary  border border-[#66666690]
            outline-none text-sm text-ascent-1 px-4 py-3 placeholder:text-[#666] ${styles}`}
        {...register}   
        aria-invalid= {error ?"true":"false"} 
        />
      </div>
      {error && <span className='text-xs mt-1 text-[#f64949fe]'>{error}</span>}
    </div>
  )
})

export default TextInput


//spreading of register ...register is done if we did not do this then when we reuse component it overwrite the values
//this is a reusable component for text input it made so that we can use again
// forwardRef: Used to pass a ref to a child component, allowing access to the child's DOM node or component instance. if we have to target a child component from parent component