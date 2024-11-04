import { useNavigate } from "react-router";

//404 상황에서 표시될 페이지
const PageNotFound = ()=>{
    //navigate
    const navigate = useNavigate();

    //view
    return (<>
        <div className="row mt-4">
            <div className="col">
                <h2>요청하신 페이지를 찾을 수 없습니다</h2>
                <button type="button" className="btn btn-secondary"
                        onClick={e=>navigate(-1)}>
                    뒤로가기
                </button>
            </div>
        </div>
    </>);
};

export default PageNotFound;