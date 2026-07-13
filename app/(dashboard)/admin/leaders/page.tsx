import { CreateUserForm } from "@/components/admin/CreateUserForm";

export default function ManageLeaders() { 
    return (
        <div>
            <h1 className = "metal-text">Manage Leaders</h1>
            <p> Bang hien thi danh sach leader: name, email, .... </p>
            <p> Tao leader (tao moi hoac chi dinh nhan vien cong ty lam leader) </p>
            <p> Xem chi tiet ho so Leader, Xem danh sach Intern ma leader nay quan ly</p>
            <p> Chinh sua va xoa leader </p>
            <p> Giao task cho Leader (de leader giao xuong cho nhom intern ma leader nay quan ly)</p>
            <p> .... </p>
            <CreateUserForm/>
        </div> )
}

    