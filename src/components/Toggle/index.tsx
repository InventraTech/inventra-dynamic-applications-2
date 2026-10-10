interface ToggleProps {
    enabled: boolean,
    onToggle: () => void,
    ariaLabel: string
}

function Toggle({ enabled, onToggle, ariaLabel }: ToggleProps) {
    const styles = enabled ? {
        toggleTrack: "bg-purple-800",
        toggleThumb: "translate-x-5.5"

    } : {
        toggleTrack: "bg-gray-300",
        toggleThumb: ""
    }

    return (
        <main>
            <button 
                className={` ${styles.toggleTrack} rounded-full w-14 h-8.5 cursor-pointer flex relative transition-all`}
                onClick={onToggle}
                aria-label={ariaLabel}>
                <span className={`${styles.toggleThumb} bg-white rounded-full h-6.5 w-6.5 absolute top-1 left-1 transition-transform duration-250`}></span>
            </button>
        </main>
    )
}

export default Toggle;