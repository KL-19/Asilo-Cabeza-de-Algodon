        function abrirSolicitud() {

            document
                .getElementById("modalSolicitud")
                .classList.add("show");

        }


        function cerrarSolicitud() {

            document
                .getElementById("modalSolicitud")
                .classList.remove("show");

        }

        document
            .getElementById("modalSolicitud")
            .addEventListener("click", function(event) {

                if (event.target === this) {

                    cerrarSolicitud();

                }

            });
