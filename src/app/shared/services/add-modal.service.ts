import {UiFormModalComponent} from "../ui/ui-form-modal/ui-form-modal.component";
import {FieldConfig} from "../ui/ui-dynamic-form/ui-dynamic-form.types";
import {MatDialog} from "@angular/material/dialog";
import {Injectable} from "@angular/core";

@Injectable({ providedIn: 'root' })
export class AddModalService {
    constructor(private dialog: MatDialog) {}

    open<T>(title: string, fields: FieldConfig[], initModel: any = {}) {
        return this.dialog.open(UiFormModalComponent, {
            width: '1200px',
            maxWidth: '95vw',
            data: { title, fields, initModel }
        });
    }
}
