import { useState, useEffect } from 'react'
import { addMembers } from '../api'



const VariableInputs = ({ membersAdded, enterClicked, maxInputs }) => {
  const [nicknames, setNicknames] = useState(["", ""])
  const [showErrors, setShowErrors] = useState(false)
  const [generalError, setGeneralError] = useState('')

  const handleChange = (value, index) => {
    setShowErrors(false)
    setGeneralError(false)
    setNicknames(prev => {
      const updated = [...prev];
      updated[index] = value;

      const allFilledExceptLast = updated
        .slice(0, -1)
        .every(n => n.length >= 3);

      const lastFilled = updated[updated.length - 1].length >= 3;

      if (allFilledExceptLast && lastFilled && updated.length < maxInputs) {
        return [...updated, ""];
      }

      return updated;
    });
  };

  useEffect(() => {
    if (!showErrors && !generalError) {
      const run = async () => {
        try {
          const allValid = nicknames.reduce((acc, nickname) => {
            return acc && (nickname.length === 0 || nickname.length > 2)
          }, true)
          if (allValid) {
            const res = await addMembers(nicknames.filter(n => n.length > 2))
            if (res.ok) {
              membersAdded(res.data)
            } else {
              setGeneralError(res.error)
            }
          } else {
            setShowErrors(true)
          }
        } catch (e) {
          setGeneralError('Unexpected error')
        }
      }
      run()
    }
  }, [enterClicked])

  return (
    <>
      {nicknames.map((nickname, i) => (
        <input
          key={i}
          placeholder={`Nickname ${i + 1}`}
          className={`px-4 py-2 bg-gray-100 rounded-md w-full border border-gray-200 mt-2 ${showErrors ? 'text-red-500' : 'text-gray-900'}`}
          value={nickname}
          onChange={e => handleChange(e.target.value, i)}
        />
      ))}
      {showErrors && <p className='text-red-500'>Nicknames must be at least 3 characters</p>}
      <p className='text-red-500'>{generalError}</p>
    </>
  );
};


export default VariableInputs