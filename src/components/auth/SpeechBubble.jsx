import { faBoltLightning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

const SpeechBubble = () => {

    return (
        <button
            type="button"
            className="relative px-5 py-3 rounded-full border border-black/15 bg-white shadow-sm hover:bg-black/5 transition flex items-center gap-2"
        >
            <FontAwesomeIcon icon={faBoltLightning} className="text-yellow-500" />
            <span className="font-semibold">3초 만에 빠른 회원가입</span>
            {/* 말풍선 꼬리 */}
            <span className="absolute left-1/2 -bottom-[9px] -translate-x-1/2 w-4 h-4 rotate-45 border-b border-r border-black/15 bg-white" />
        </button>
    )
}

export default SpeechBubble;